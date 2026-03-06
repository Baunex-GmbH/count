package ch.count.document

import java.math.BigDecimal

data class OcrResult(
    val betrag: BigDecimal? = null,
    val netto: BigDecimal? = null,
    val mwst: BigDecimal? = null,
    val mwstSatz: BigDecimal? = null,
    val datum: String? = null,
    val lieferant: String? = null,
    val belegTyp: String? = null,
    val beschreibung: String? = null,
    val confidence: Int? = null,
    val waehrung: String? = null,
)
