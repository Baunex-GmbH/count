package ch.count.document

import java.time.LocalDateTime

data class DocumentDto(
    val id: String,
    val tenantId: String,
    val dateiname: String,
    val dateityp: String,
    val uploadDatum: LocalDateTime,
    val uploadedBy: String,
    val status: String,
    val ocrResult: OcrResult?,
    val vorschauUrl: String?,
    val auditLog: List<AuditEntryDto>,
)

data class AuditEntryDto(
    val id: String,
    val documentId: String,
    val timestamp: LocalDateTime,
    val userId: String,
    val userName: String,
    val action: String,
    val details: String?,
)

data class StatusUpdateRequest(
    val status: String = "",
)

data class OcrUpdateRequest(
    val ocrResult: OcrResult? = null,
)
