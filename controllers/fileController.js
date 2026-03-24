// controllers/fileController.js
const fileConversionService = require("../services/fileConversionService");
const conversionJobRepository = require("../repositories/conversionJobRepository");
const path = require("path");
const fs = require("fs/promises");
const { detectDocumentType } = require("../utils/documentDetector");
const {
  validateFormatCompatibility,
  getDefaultFormat,
} = require("../utils/documentFormatRules");
const {
  validateDataIntegrity,
  applyBusinessValidations,
} = require("../utils/validationUtils");
const { applyTransformations } = require("../utils/transformationUtils");
const FinishedProduct = require("../models/FinishedProduct");

// Middleware de Multer (configúralo una vez)
const multer = require("multer");
const upload = multer({ dest: "temp_uploads/" });

// Helper function for checking file existence asynchronously
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const uploadAndConvertFile = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No se ha proporcionado ningún archivo." });
  }

  const { path: tempFilePath, originalname } = req.file;
  const { outputFormat, ...conversionOptions } = req.body;
  let fileBuffer;

  try {
    // Read the buffer once for potential detection and for processing
    fileBuffer = await fs.readFile(tempFilePath);
  } catch (readError) {
    // If the file can't be read, delete the temp file and return an error
    await fs.unlink(tempFilePath).catch(() => {});
    return res
      .status(500)
      .json({ message: "Error reading uploaded file.", error: readError.message });
  }

  if (!outputFormat) {
    await fs.unlink(tempFilePath);
    return res
      .status(400)
      .json({ message: "El formato de salida es requerido." });
  }

  // --- REVISED DETECTION LOGIC ---
  // If documentType is NOT provided by the user, attempt auto-detection.
  if (!conversionOptions.documentType) {
    console.log(
      "[FileController] documentType not provided. Attempting auto-detection."
    );
    const detectedType = await detectDocumentType(fileBuffer, originalname);

    if (detectedType) {
      // If detection is successful, use the detected type.
      conversionOptions.documentType = detectedType;
      console.log(
        `[FileController] Auto-detected documentType: "${detectedType}"`
      );
    } else {
      // If detection fails (ambiguity, low score, etc.), return a specific error.
      // This prompts the frontend to ask the user for manual input.
      console.log(
        "[FileController] Auto-detection failed. Requesting manual input from user."
      );
      await fs.unlink(tempFilePath); // Clean up the temporary file
      return res.status(400).json({
        message:
          "Could not determine document type. Please select it manually.",
        errorType: "AMBIGUITY_DETECTED", // This is the key for the frontend
      });
    }
  }

  // Validar que el formato de salida sea compatible con el tipo de documento
  if (conversionOptions.documentType) {
    const validation = validateFormatCompatibility(
      conversionOptions.documentType, 
      outputFormat
    );
    
    if (!validation.isValid) {
      await fs.unlink(tempFilePath);
      return res.status(400).json({ message: validation.message });
    }
  }
  // --- END OF REVISED LOGIC ---

  // This check assumes a middleware has populated req.user
  if (!req.user || !req.user.id) {
    await fs.unlink(tempFilePath);
    return res.status(401).json({
      message: "Usuario no autenticado para realizar esta operacion.",
    });
  }

  let newJob;
  try {
    newJob = await conversionJobRepository.createConversionJob({
      userId: req.user.id,
      fileName: originalname,
      originalFilePath: tempFilePath,
      outputFormat: outputFormat,
      conversionOptions: conversionOptions,
      status: "processing",
      isAutomated: false,
    });

    const { convertedFilePath, errorReportPath, status } =
      await fileConversionService.processFileForConversion(
        fileBuffer, // Use the buffer we already read
        originalname,
        outputFormat,
        conversionOptions,
        req.user.id,
        false
      );

    await conversionJobRepository.updateConversionJobStatus(newJob._id, status, {
      convertedFilePath,
      errorReportPath,
      completedAt: new Date(),
    });

    // The temp file is no longer needed after processing is complete
    await fs.unlink(tempFilePath);

    res.status(200).json({
      message: "Archivo procesado exitosamente.",
      jobId: newJob._id,
      documentType: conversionOptions.documentType, // Return the type used
      status: status,
    });
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    // Cleanup in case of failure
    if (await fileExists(tempFilePath)) {
      await fs
        .unlink(tempFilePath)
        .catch((e) =>
          console.error("Error deleting temp file in error handler:", e)
        );
    }
    if (newJob && newJob._id) {
      await conversionJobRepository.updateConversionJobStatus(
        newJob._id,
        "failed",
        {
          errorMessage: error.message,
        }
      );
    }
    res
      .status(500)
      .json({ message: "Error al procesar el archivo.", error: error.message });
  }
};

const getConvertedFile = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await conversionJobRepository.getConversionJobById(jobId);

    if (!job) {
      return res
        .status(404)
        .json({ message: "Trabajo de conversión no encontrado." });
    }

    // Authorization checks
    if (job.userId && job.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Acceso denegado. No tienes permisos para este archivo." });
    }
    if (!job.userId && job.isAutomated && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Acceso denegado. Este es un archivo de conversión automatizado.",
      });
    }

    if (job.status !== "completed" && job.status !== "completed_with_errors") {
      return res
        .status(409)
        .json({ message: "El archivo aún no ha sido procesado o falló." });
    }

    if (!job.convertedFilePath || !(await fileExists(job.convertedFilePath))) {
      return res
        .status(404)
        .json({ message: "Archivo convertido no encontrado en el servidor." });
    }

    const downloadName = path.basename(job.convertedFilePath);

    // If this job corresponds to a finishedProduct file, store last download name
    try {
      if (
        job.conversionOptions &&
        job.conversionOptions.documentType === "finishedProduct"
      ) {
        await FinishedProduct.updateOne(
          { sourceJobId: job._id },
          { $set: { lastDownloadedName: downloadName } }
        );
      }
    } catch (updateError) {
      console.warn(
        "No se pudo actualizar lastDownloadedName:",
        updateError.message
      );
    }

    res.download(job.convertedFilePath, downloadName, (err) => {
      if (err) {
        console.error("Error al enviar el archivo para descarga:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error al descargar el archivo." });
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener archivo convertido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const getErrorReport = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await conversionJobRepository.getConversionJobById(jobId);

    if (!job) {
      return res
        .status(404)
        .json({ message: "Trabajo de conversión no encontrado." });
    }

    // Authorization checks
    if (job.userId && job.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Acceso denegado." });
    }
    if (!job.userId && job.isAutomated && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Acceso denegado. Este es un reporte de errores automatizado.",
      });
    }

    if (!job.errorReportPath || !(await fileExists(job.errorReportPath))) {
      return res
        .status(404)
        .json({ message: "Reporte de errores no disponible." });
    }

    res.download(job.errorReportPath, `error_report_${jobId}.json`, (err) => {
      if (err) {
        console.error("Error al enviar el reporte de errores:", err);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: "Error al descargar el reporte de errores." });
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener reporte de errores:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const validateManualData = async (req, res) => {
  const { documentType, rows } = req.body || {};

  if (!documentType) {
    return res.status(400).json({ message: "documentType es requerido." });
  }
  if (!Array.isArray(rows)) {
    return res.status(400).json({ message: "rows debe ser un arreglo." });
  }

  const parsedData = { Sheet1: rows };
  const transformedData = applyTransformations(parsedData, documentType);
  const integrityResult = validateDataIntegrity(transformedData, documentType);
  const errors = [...integrityResult.errors];

  if (integrityResult.isValid) {
    const businessResult = await applyBusinessValidations(
      transformedData,
      documentType
    );
    if (!businessResult.isValid) {
      errors.push(...businessResult.errors);
    }
  }

  return res.status(200).json({
    isValid: errors.length === 0,
    errors,
  });
};

const createManualFile = async (req, res) => {
  const { documentType, rows, outputFormat, displayName } = req.body || {};
  const normalizedName =
    typeof displayName === "string" ? displayName.trim() : "";

  if (!documentType) {
    return res.status(400).json({ message: "documentType es requerido." });
  }
  if (!Array.isArray(rows)) {
    return res.status(400).json({ message: "rows debe ser un arreglo." });
  }

  const finalOutputFormat = outputFormat || getDefaultFormat(documentType);
  if (!finalOutputFormat) {
    return res.status(400).json({
      message: "No se pudo determinar el formato de salida.",
    });
  }

  const formatValidation = validateFormatCompatibility(
    documentType,
    finalOutputFormat
  );
  if (!formatValidation.isValid) {
    return res.status(400).json({ message: formatValidation.message });
  }

  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: "Usuario no autenticado para realizar esta operacion.",
    });
  }

  let newJob;
  try {
    newJob = await conversionJobRepository.createConversionJob({
      userId: req.user.id,
      fileName: `manual-${documentType}.${finalOutputFormat}`,
      originalFilePath: `manual-${documentType}`,
      outputFormat: finalOutputFormat,
      conversionOptions: {
        documentType,
        displayName: normalizedName || undefined,
      },
      status: "processing",
      isAutomated: false,
    });

    const {
      convertedFilePath,
      errorReportPath,
      status,
      errors,
      transformedRows,
      outputFileName,
    } =
      await fileConversionService.processManualDataForConversion(
        rows,
        finalOutputFormat,
        { documentType }
      );

    let savedCount = 0;
    let savedDb = "";
    let savedCollection = "";
    if (documentType === "finishedProduct" && status === "completed") {
      const rowsToSave = Array.isArray(transformedRows) ? transformedRows : [];
      if (rowsToSave.length > 0) {
        const adminFileName =
          normalizedName ||
          (typeof outputFileName === "string" ? outputFileName : "");

        const savedDoc = await FinishedProduct.create({
          adminFileName: adminFileName || undefined,
          createdBy: req.user.id,
          sourceJobId: newJob._id,
          rows: rowsToSave,
        });

        savedCount = savedDoc ? 1 : 0;
        savedDb = FinishedProduct.db.name;
        savedCollection = FinishedProduct.collection.name;
        console.log(
          `[FinishedProduct] Inserted ${savedCount} doc into ${savedDb}.${savedCollection}`
        );
      }
    }

    await conversionJobRepository.updateConversionJobStatus(newJob._id, status, {
      convertedFilePath,
      errorReportPath,
      completedAt: new Date(),
    });

    return res.status(200).json({
      message: "Archivo procesado exitosamente.",
      jobId: newJob._id,
      documentType,
      status,
      errors: errors || [],
      savedCount,
      savedDb,
      savedCollection,
    });
  } catch (error) {
    console.error("Error al procesar datos manuales:", error);
    if (newJob && newJob._id) {
      await conversionJobRepository.updateConversionJobStatus(
        newJob._id,
        "failed",
        { errorMessage: error.message }
      );
    }
    return res.status(500).json({
      message: "Error al procesar los datos manuales.",
      error: error.message,
    });
  }
};

const getAdminFilesByType = async (req, res) => {
  const { type } = req.query || {};
  if (!type) {
    return res.status(400).json({ message: "type es requerido." });
  }

  if (type !== "finishedProduct") {
    return res.status(400).json({
      message: "Solo finishedProduct esta habilitado por ahora.",
    });
  }

  try {
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    const query = isAdmin ? {} : { createdBy: req.user.id };
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);

    const docs = await FinishedProduct.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .select("adminFileName lastDownloadedName createdBy createdAt updatedAt")
      .lean();

    return res.status(200).json({ documents: docs });
  } catch (error) {
    console.error("Error al listar archivos admin:", error);
    return res.status(500).json({
      message: "Error interno del servidor al listar archivos.",
    });
  }
};

const downloadAdminFileById = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query || {};

  if (!id) {
    return res.status(400).json({ message: "id es requerido." });
  }
  if (type !== "finishedProduct") {
    return res
      .status(400)
      .json({ message: "Solo finishedProduct esta habilitado por ahora." });
  }

  try {
    const doc = await FinishedProduct.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Archivo no encontrado." });
    }

    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isAdmin && String(doc.createdBy || "") !== String(req.user.id || "")) {
      return res.status(403).json({ message: "Acceso denegado." });
    }

    const rowsToExport = Array.isArray(doc.rows) ? doc.rows : [];
    if (!rowsToExport.length) {
      return res
        .status(409)
        .json({ message: "No hay filas para exportar." });
    }

    const {
      convertedFilePath,
      status,
      outputFileName,
    } = await fileConversionService.processManualDataForConversion(
      rowsToExport,
      null,
      { documentType: "finishedProduct" }
    );

    if (status !== "completed" || !convertedFilePath) {
      return res.status(409).json({
        message: "No se pudo generar el archivo para descarga.",
      });
    }

    const nomenclature =
      typeof outputFileName === "string" && outputFileName
        ? outputFileName
        : "finishedProduct.txt";

    doc.lastDownloadedName = nomenclature;
    await doc.save();

    return res.download(convertedFilePath, nomenclature, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error al descargar el archivo." });
        }
      }
    });
  } catch (error) {
    console.error("Error al descargar archivo admin:", error);
    return res
      .status(500)
      .json({ message: "Error interno al descargar el archivo." });
  }
};

module.exports = {
  upload,
  uploadAndConvertFile,
  getConvertedFile,
  getErrorReport,
  validateManualData,
  createManualFile,
  getAdminFilesByType,
  downloadAdminFileById,
};
