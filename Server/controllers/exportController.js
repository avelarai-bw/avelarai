const PDFDocument = require('pdfkit');
const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');
const Analysis = require('../models/Analysis');

const fmt = (val) => {
  if (val === null || val === undefined) return '—';
  return Number.isInteger(val) ? String(val) : Number(val).toFixed(2);
};

const exportPDF = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${analysis.fileName.replace(/\.[^.]+$/, '')}-report.pdf"`
    );

    doc.pipe(res);

    // HEADER
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#0D6EFD')
      .text('AvelarAI', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#8B97B5')
      .text('AI-Powered Data Analysis Report', 50, 80);

    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#1E2D47').stroke();

    // FILE INFO
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#F0F4FF')
      .text(analysis.fileName, 50, 120);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#8B97B5')
      .text(`Generated: ${new Date(analysis.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })}`, 50, 148);

    let y = 180;

    // METRICS
    if (analysis.statistics) {
      const stats = analysis.statistics;
      doc.rect(50, y, 120, 60).fillColor('#111827').fill();
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#F0F4FF').text(
        stats.rowCount.toLocaleString(), 58, y + 10
      );
      doc.fontSize(9).font('Helvetica').fillColor('#8B97B5').text('Total rows', 58, y + 38);

      doc.rect(185, y, 120, 60).fillColor('#111827').fill();
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#F0F4FF').text(
        String(stats.columnCount), 193, y + 10
      );
      doc.fontSize(9).font('Helvetica').fillColor('#8B97B5').text('Columns', 193, y + 38);

      const numericCols = stats.columns?.filter(c => c.type === 'numeric') || [];
      if (numericCols[0]) {
        doc.rect(320, y, 120, 60).fillColor('#111827').fill();
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#00C9B1').text(
          fmt(numericCols[0].mean), 328, y + 10
        );
        doc.fontSize(9).font('Helvetica').fillColor('#8B97B5').text(
          `Mean — ${numericCols[0].name}`, 328, y + 38
        );
      }

      y += 80;
    }

    // AI SUMMARY
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#1E2D47').stroke();
    y += 15;
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D6EFD').text('AI SUMMARY', 50, y);
    y += 20;
    doc.fontSize(10).font('Helvetica').fillColor('#8B97B5')
      .text(analysis.chartData?.summary || 'No summary available.', 50, y, {
        width: 495, lineGap: 4
      });
    y += doc.heightOfString(analysis.chartData?.summary || '', { width: 495 }) + 25;

    // KEY INSIGHTS
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#1E2D47').stroke();
    y += 15;
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D6EFD').text('KEY INSIGHTS', 50, y);
    y += 20;

    const insights = analysis.chartData?.keyInsights || [];
    insights.forEach((insight, i) => {
      doc.rect(50, y, 3, 14).fillColor('#00C9B1').fill();
      doc.fontSize(10).font('Helvetica').fillColor('#8B97B5')
        .text(`${insight}`, 62, y, { width: 483, lineGap: 3 });
      y += doc.heightOfString(insight, { width: 483 }) + 12;
    });

    y += 10;

    // AI INTERPRETATION
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#1E2D47').stroke();
    y += 15;
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D6EFD').text('AI INTERPRETATION', 50, y);
    y += 20;
    doc.fontSize(10).font('Helvetica').fillColor('#8B97B5')
      .text(analysis.interpretation || 'No interpretation available.', 50, y, {
        width: 495, lineGap: 4
      });
    y += doc.heightOfString(analysis.interpretation || '', { width: 495 }) + 25;

    // COLUMN STATISTICS
    if (analysis.statistics?.columns?.length) {
      if (y > 650) { doc.addPage(); y = 50; }

      doc.moveTo(50, y).lineTo(545, y).strokeColor('#1E2D47').stroke();
      y += 15;
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D6EFD').text('COLUMN STATISTICS', 50, y);
      y += 20;

      // Table header
      const cols = [120, 80, 55, 60, 55, 55, 55, 45, 45];
      const headers = ['Column', 'Type', 'Mean', 'Median', 'Std Dev', 'Variance', 'Mode', 'Min', 'Max'];
      let x = 50;

      doc.rect(50, y, 495, 20).fillColor('#111827').fill();
      headers.forEach((h, i) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#4A5568')
          .text(h, x + 4, y + 6, { width: cols[i] });
        x += cols[i];
      });
      y += 20;

      analysis.statistics.columns.forEach((col, idx) => {
        if (y > 750) { doc.addPage(); y = 50; }
        const bg = idx % 2 === 0 ? '#0A0E1A' : '#111827';
        doc.rect(50, y, 495, 18).fillColor(bg).fill();
        x = 50;
        const vals = [
          col.name,
          col.type,
          fmt(col.mean),
          fmt(col.median),
          fmt(col.stdDev),
          fmt(col.variance),
          col.mode !== null ? String(col.mode) : '—',
          fmt(col.min),
          fmt(col.max),
        ];
        vals.forEach((v, i) => {
          doc.fontSize(8).font('Helvetica').fillColor('#8B97B5')
            .text(v, x + 4, y + 5, { width: cols[i] });
          x += cols[i];
        });
        y += 18;
      });
    }

    // FOOTER
    doc.fontSize(8).font('Helvetica').fillColor('#4A5568')
      .text('Generated by AvelarAI — AI-Powered Data Analysis', 50, 780, {
        align: 'center', width: 495
      });

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ message: 'Export failed' });
  }
};

const exportWord = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    const stats = analysis.statistics;
    const insights = analysis.chartData?.keyInsights || [];

    const children = [
      // Title
      new Paragraph({
        text: 'AvelarAI Analysis Report',
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'File: ', bold: true, color: '8B97B5' }),
          new TextRun({ text: analysis.fileName, color: '8B97B5' }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Generated: ', bold: true, color: '8B97B5' }),
          new TextRun({
            text: new Date(analysis.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            }),
            color: '8B97B5',
          }),
        ],
        spacing: { after: 400 },
      }),

      // Summary
      new Paragraph({
        text: 'AI Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        text: analysis.chartData?.summary || 'No summary available.',
        spacing: { after: 400 },
      }),

      // Key Insights
      new Paragraph({
        text: 'Key Insights',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      ...insights.map(insight => new Paragraph({
        text: `• ${insight}`,
        spacing: { after: 120 },
      })),

      // Interpretation
      new Paragraph({
        text: 'AI Interpretation',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: analysis.interpretation || 'No interpretation available.',
        spacing: { after: 400 },
      }),
    ];

    // Column Statistics Table
    if (stats?.columns?.length) {
      children.push(
        new Paragraph({
          text: 'Column Statistics',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      const headerRow = new TableRow({
        children: ['Column', 'Type', 'Mean', 'Median', 'Std Dev', 'Variance', 'Min', 'Max'].map(
          h => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: h, bold: true })],
            })],
            width: { size: 12, type: WidthType.PERCENTAGE },
          })
        ),
      });

      const dataRows = stats.columns.map(col =>
        new TableRow({
          children: [
            col.name,
            col.type,
            fmt(col.mean),
            fmt(col.median),
            fmt(col.stdDev),
            fmt(col.variance),
            fmt(col.min),
            fmt(col.max),
          ].map(val =>
            new TableCell({
              children: [new Paragraph({ text: val })],
              width: { size: 12, type: WidthType.PERCENTAGE },
            })
          ),
        })
      );

      children.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }

    // Footer
    children.push(
      new Paragraph({
        text: 'Generated by AvelarAI — AI-Powered Data Analysis',
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        children: [new TextRun({ text: 'Generated by AvelarAI — AI-Powered Data Analysis', color: '8B97B5', size: 18 })],
      })
    );

    const doc = new Document({
      sections: [{ children }],
    });

    const { Packer } = require('docx');
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${analysis.fileName.replace(/\.[^.]+$/, '')}-report.docx"`
    );
    res.send(buffer);
  } catch (err) {
    console.error('Word export error:', err);
    res.status(500).json({ message: 'Export failed' });
  }
};

module.exports = { exportPDF, exportWord };