const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const db = require("../config/db");

router.get("/herramientas", async (req, res) => {
  try {
    const sql = `
      SELECT 
        h.id_herramienta,
        h.nombre,
        h.serie,
        h.stock,
        c.nombre_categoria,
        e.nombre_estado,
        s.nombre_status,
        m.nombre_marca
      FROM herramientas h
      LEFT JOIN categorias c ON h.id_categoria = c.id_categoria
      LEFT JOIN estado_herramienta e ON h.id_estado = e.id_estado
      LEFT JOIN status_herramienta s ON h.id_status = s.id_status
      LEFT JOIN marcas m ON h.id_marca = m.id_marca
      ORDER BY h.id_herramienta ASC
    `;

    const [herramientas] = await db.query(sql);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=reporte_herramientas.pdf");

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });
    doc.pipe(res);

    const fecha = new Date().toLocaleDateString("es-PE");
    const hora = new Date().toLocaleTimeString("es-PE");

    doc.rect(40, 40, 515, 50).fill("#1a1a2e");

    doc.fillColor("white").font("Helvetica-Bold").fontSize(16)
      .text("ToolControl", 55, 48);

    doc.font("Helvetica").fontSize(9).fillColor("#cccccc")
      .text("Sistema de préstamo de herramientas", 55, 67);

    doc.font("Helvetica-Bold").fontSize(10).fillColor("white")
      .text("Reporte General de Herramientas", 300, 48, { width: 240, align: "right" });

    doc.font("Helvetica").fontSize(8).fillColor("#cccccc")
      .text("Fecha: " + fecha + "   Hora: " + hora, 300, 65, { width: 240, align: "right" });

    const total = herramientas.length;
    const disponibles = herramientas.filter(h => (h.nombre_status || "").toLowerCase().includes("disponible")).length;
    const prestadas = herramientas.filter(h => (h.nombre_status || "").toLowerCase().includes("prestado")).length;
    const vencidas = total - disponibles - prestadas;

    doc.rect(40, 102, 120, 40).fill("#f0f7ff");
    doc.rect(40, 102, 3, 40).fill("#378ADD");
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1a1a2e").text(String(total), 50, 108);
    doc.font("Helvetica").fontSize(7).fillColor("#666666").text("TOTAL REGISTRADAS", 50, 128);

    doc.rect(168, 102, 120, 40).fill("#f0fff8");
    doc.rect(168, 102, 3, 40).fill("#1D9E75");
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1a1a2e").text(String(disponibles), 178, 108);
    doc.font("Helvetica").fontSize(7).fillColor("#666666").text("DISPONIBLES", 178, 128);

    doc.rect(296, 102, 120, 40).fill("#fffbf0");
    doc.rect(296, 102, 3, 40).fill("#EF9F27");
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1a1a2e").text(String(prestadas), 306, 108);
    doc.font("Helvetica").fontSize(7).fillColor("#666666").text("PRESTADAS", 306, 128);

    doc.rect(424, 102, 131, 40).fill("#fff0f0");
    doc.rect(424, 102, 3, 40).fill("#E24B4A");
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1a1a2e").text(String(vencidas), 434, 108);
    doc.font("Helvetica").fontSize(7).fillColor("#666666").text("VENCIDAS", 434, 128);

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#666666")
      .text("DETALLE DE HERRAMIENTAS", 40, 154);
    doc.moveTo(40, 166).lineTo(555, 166).lineWidth(0.5).strokeColor("#dddddd").stroke();

    let y = 172;
    doc.rect(40, y, 515, 16).fill("#1a1a2e");
    doc.font("Helvetica-Bold").fontSize(7).fillColor("white");
    doc.text("#",         45,  y + 4);
    doc.text("Nombre",    68,  y + 4);
    doc.text("Marca",     155, y + 4);
    doc.text("Serie",     220, y + 4);
    doc.text("Stock",     278, y + 4);
    doc.text("Categoría", 308, y + 4);
    doc.text("Estado",    400, y + 4);
    doc.text("Status",    468, y + 4);
    y += 16;

    herramientas.slice(0, 32).forEach((h, i) => {
      if (i % 2 === 0) {
        doc.rect(40, y, 515, 16).fill("#fafafa");
      } else {
        doc.rect(40, y, 515, 16).fill("white");
      }

      doc.moveTo(40, y + 15.5).lineTo(555, y + 15.5).lineWidth(0.5).strokeColor("#f0f0f0").stroke();

      doc.font("Helvetica").fontSize(7).fillColor("#999999")
        .text(String(h.id_herramienta), 45, y + 4);

      doc.fillColor("#1a1a2e").font("Helvetica-Bold")
        .text(h.nombre || "-", 68, y + 4, { width: 82 });

      doc.fillColor("#333333").font("Helvetica")
        .text(h.nombre_marca || "-", 155, y + 4, { width: 60 });

      doc.fillColor("#999999")
        .text(h.serie || "-", 220, y + 4, { width: 54 });

      doc.fillColor("#1a1a2e").font("Helvetica-Bold")
        .text(String(h.stock), 278, y + 4);

      doc.fillColor("#333333").font("Helvetica")
        .text(h.nombre_categoria || "-", 308, y + 4, { width: 86 });

      doc.rect(398, y + 2, 62, 12).fill("#dbeafe");
      doc.fillColor("#1e40af").font("Helvetica-Bold").fontSize(6.5)
        .text(h.nombre_estado || "-", 400, y + 5, { width: 58, align: "center" });

      doc.rect(466, y + 2, 62, 12).fill("#dcfce7");
      doc.fillColor("#166534").font("Helvetica-Bold").fontSize(6.5)
        .text(h.nombre_status || "-", 468, y + 5, { width: 58, align: "center" });

      y += 16;
    });

    doc.moveTo(40, 760).lineTo(555, 760).lineWidth(0.5).strokeColor("#dddddd").stroke();
    doc.font("Helvetica").fontSize(7.5).fillColor("#aaaaaa")
      .text("ToolControl — Reporte generado automáticamente", 40, 768);
    doc.text("Página 1 de 1", 40, 768, { width: 515, align: "right" });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al generar el reporte" });
  }
});

module.exports = router;