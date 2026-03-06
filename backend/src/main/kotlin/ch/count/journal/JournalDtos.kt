package ch.count.journal

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class JournalEntryDto(
    val id: String,
    val tenantId: String,
    val documentId: String?,
    val buchungsDatum: LocalDate,
    val erfassungsDatum: LocalDateTime,
    val belegnummer: String,
    val beschreibung: String?,
    val status: String,
    val lines: List<JournalLineDto>,
)

data class JournalLineDto(
    val id: String,
    val kontoNummer: String,
    val kontoBezeichnung: String,
    val soll: BigDecimal,
    val haben: BigDecimal,
    val text: String?,
)

data class CreateJournalEntryRequest(
    val tenantId: String = "",
    val documentId: String? = null,
    val buchungsDatum: LocalDate = LocalDate.now(),
    val belegnummer: String = "",
    val beschreibung: String? = null,
    val status: String = "OCR-Vorschlag",
    val lines: List<CreateJournalLineRequest> = emptyList(),
)

data class CreateJournalLineRequest(
    val kontoNummer: String = "",
    val kontoBezeichnung: String = "",
    val soll: BigDecimal = BigDecimal.ZERO,
    val haben: BigDecimal = BigDecimal.ZERO,
    val text: String? = null,
)
