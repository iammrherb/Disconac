import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, UnderlineType } from 'docx';
import type { ScopingSession, CustomerProfile, DeploymentChecklist, QuestionnaireResponse } from '@shared/schema';

interface ExportData {
  session: ScopingSession & { customer?: CustomerProfile };
  responses: QuestionnaireResponse[];
  checklist: DeploymentChecklist[];
  recommendedDocs?: any[];
  aiRecommendations?: any;
}

/**
 * Generate PDF deployment guide with Portnox branding
 */
export async function generatePDF(data: ExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Portnox brand colors
  const portnoxBlue = rgb(0, 0.45, 0.71); // #0073B5
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);
  
  // Load fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  // Cover page
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  
  // Header with Portnox branding
  page.drawText('PORTNOX', {
    x: 50,
    y: height - 80,
    size: 32,
    font: titleFont,
    color: portnoxBlue,
  });
  
  page.drawLine({
    start: { x: 50, y: height - 90 },
    end: { x: width - 50, y: height - 90 },
    thickness: 3,
    color: portnoxBlue,
  });
  
  // Title
  page.drawText('Network Access Control', {
    x: 50,
    y: height - 150,
    size: 24,
    font: headingFont,
    color: darkGray,
  });
  
  page.drawText('Deployment & Implementation Guide', {
    x: 50,
    y: height - 180,
    size: 20,
    font: bodyFont,
    color: lightGray,
  });
  
  // Customer information
  const customerName = data.session.customer?.companyName || 'Customer';
  page.drawText(`Prepared for: ${customerName}`, {
    x: 50,
    y: height - 250,
    size: 16,
    font: bodyFont,
    color: darkGray,
  });
  
  page.drawText(`Session: ${data.session.sessionName}`, {
    x: 50,
    y: height - 280,
    size: 14,
    font: bodyFont,
    color: lightGray,
  });
  
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  page.drawText(`Generated: ${date}`, {
    x: 50,
    y: height - 310,
    size: 12,
    font: bodyFont,
    color: lightGray,
  });
  
  // Footer
  page.drawText('Confidential - For Internal Use Only', {
    x: 50,
    y: 50,
    size: 10,
    font: bodyFont,
    color: lightGray,
  });
  
  // Table of Contents page
  page = pdfDoc.addPage([612, 792]);
  let yPosition = height - 80;
  
  page.drawText('Table of Contents', {
    x: 50,
    y: yPosition,
    size: 24,
    font: headingFont,
    color: portnoxBlue,
  });
  
  yPosition -= 50;
  
  const tocItems = [
    '1. Executive Summary',
    '2. Customer Profile',
    '3. Infrastructure Assessment',
    '4. Deployment Checklist',
    '5. Best Practices & Recommendations',
    '6. Documentation References',
  ];
  
  tocItems.forEach((item) => {
    page.drawText(item, {
      x: 70,
      y: yPosition,
      size: 14,
      font: bodyFont,
      color: darkGray,
    });
    yPosition -= 30;
  });
  
  // Customer Profile page
  page = pdfDoc.addPage([612, 792]);
  yPosition = height - 80;
  
  page.drawText('Customer Profile', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: portnoxBlue,
  });
  
  yPosition -= 40;
  
  const profileData = [
    { label: 'Company', value: data.session.customer?.companyName || 'N/A' },
    { label: 'Industry', value: data.session.customer?.industry || 'N/A' },
    { label: 'Company Size', value: data.session.customer?.companySize || 'N/A' },
    { label: 'Contact', value: data.session.customer?.contactName || 'N/A' },
    { label: 'Email', value: data.session.customer?.contactEmail || 'N/A' },
  ];
  
  profileData.forEach(({ label, value }) => {
    page.drawText(`${label}:`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    
    page.drawText(value, {
      x: 200,
      y: yPosition,
      size: 12,
      font: bodyFont,
      color: darkGray,
    });
    
    yPosition -= 25;
  });
  
  // Deployment Checklist pages
  page = pdfDoc.addPage([612, 792]);
  yPosition = height - 80;
  
  page.drawText('Deployment Checklist', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: portnoxBlue,
  });
  
  yPosition -= 40;
  
  // Group checklist by category
  const categorizedChecklist = data.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DeploymentChecklist[]>);
  
  Object.entries(categorizedChecklist).forEach(([category, items]) => {
    if (yPosition < 150) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 80;
    }
    
    page.drawText(category, {
      x: 60,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    
    yPosition -= 25;
    
    items.forEach((item, index) => {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 80;
      }
      
      // Checkbox
      const checkboxSize = 10;
      page.drawRectangle({
        x: 80,
        y: yPosition - checkboxSize,
        width: checkboxSize,
        height: checkboxSize,
        borderColor: darkGray,
        borderWidth: 1,
      });
      
      if (item.completed) {
        // Draw checkmark
        page.drawText('✓', {
          x: 81,
          y: yPosition - checkboxSize + 2,
          size: 10,
          font: bodyFont,
          color: portnoxBlue,
        });
      }
      
      // Priority badge
      const priorityColor = item.priority === 'high' ? rgb(0.8, 0, 0) : 
                           item.priority === 'medium' ? rgb(1, 0.6, 0) : 
                           rgb(0, 0.6, 0);
      
      page.drawText(`[${item.priority?.toUpperCase()}]`, {
        x: 100,
        y: yPosition,
        size: 9,
        font: bodyFont,
        color: priorityColor,
      });
      
      // Task title
      const titleText = item.itemTitle.length > 60 ? 
        item.itemTitle.substring(0, 57) + '...' : 
        item.itemTitle;
      
      page.drawText(titleText, {
        x: 160,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: darkGray,
      });
      
      yPosition -= 20;
      
      // Description if available
      if (item.itemDescription) {
        const descText = item.itemDescription.length > 80 ? 
          item.itemDescription.substring(0, 77) + '...' : 
          item.itemDescription;
        
        page.drawText(descText, {
          x: 100,
          y: yPosition,
          size: 9,
          font: bodyFont,
          color: lightGray,
        });
        
        yPosition -= 15;
      }
      
      yPosition -= 10;
    });
    
    yPosition -= 20;
  });
  
  // Add page numbers
  const pages = pdfDoc.getPages();
  pages.forEach((pg, index) => {
    pg.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width - 150,
      y: 30,
      size: 10,
      font: bodyFont,
      color: lightGray,
    });
  });
  
  return Buffer.from(await pdfDoc.save());
}

/**
 * Generate Word document deployment guide with Portnox branding
 */
export async function generateWord(data: ExportData): Promise<Buffer> {
  const customerName = data.session.customer?.companyName || 'Customer';
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Add checklist items grouped by category
  const categorizedChecklist = data.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DeploymentChecklist[]>);
  
  // Prepare all children for the section
  const allChildren: Paragraph[] = [
    // Cover page
    new Paragraph({
      text: 'PORTNOX',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    }),
    
    new Paragraph({
      text: 'Network Access Control',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
    }),
    
    new Paragraph({
      text: 'Deployment & Implementation Guide',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 400 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: 'Prepared for: ',
          bold: true,
        }),
        new TextRun({
          text: customerName,
        }),
      ],
      spacing: { after: 200 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: 'Session: ',
          bold: true,
        }),
        new TextRun({
          text: data.session.sessionName,
        }),
      ],
      spacing: { after: 200 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated: ',
          bold: true,
        }),
        new TextRun({
          text: date,
        }),
      ],
      spacing: { after: 400 },
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: 'Confidential - For Internal Use Only',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
    }),
    
    // Page break
    new Paragraph({ pageBreakBefore: true }),
    
    // Table of Contents
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
    
    new Paragraph({ text: '1. Executive Summary', spacing: { after: 200 } }),
    new Paragraph({ text: '2. Customer Profile', spacing: { after: 200 } }),
    new Paragraph({ text: '3. Infrastructure Assessment', spacing: { after: 200 } }),
    new Paragraph({ text: '4. Deployment Checklist', spacing: { after: 200 } }),
    new Paragraph({ text: '5. Best Practices & Recommendations', spacing: { after: 200 } }),
    new Paragraph({ text: '6. Documentation References', spacing: { after: 200 } }),
    
    // Page break
    new Paragraph({ pageBreakBefore: true }),
    
    // Customer Profile
    new Paragraph({
      text: 'Customer Profile',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
  ];
  
  // Customer profile table
  allChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Company', bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: customerName })],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Industry', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ text: data.session.customer?.industry || 'N/A' })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Company Size', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ text: data.session.customer?.companySize || 'N/A' })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Contact', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ text: data.session.customer?.contactName || 'N/A' })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ text: data.session.customer?.contactEmail || 'N/A' })],
            }),
          ],
        }),
      ],
    }) as any // Table needs to be cast as it's not directly compatible with children type
  );
  
  // Page break and Deployment Checklist
  allChildren.push(
    new Paragraph({ pageBreakBefore: true }),
    new Paragraph({
      text: 'Deployment Checklist',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  );
  
  // Add checklist items
  Object.entries(categorizedChecklist).forEach(([category, items]) => {
    allChildren.push(
      new Paragraph({
        text: category,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );
    
    items.forEach((item) => {
      const checkbox = item.completed ? '☑' : '☐';
      const priority = `[${item.priority?.toUpperCase()}]`;
      
      allChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${checkbox} `, size: 24 }),
            new TextRun({ text: `${priority} `, bold: true }),
            new TextRun({ text: item.itemTitle, bold: true }),
          ],
          spacing: { after: 100 },
        })
      );
      
      if (item.itemDescription) {
        allChildren.push(
          new Paragraph({
            text: item.itemDescription,
            spacing: { after: 200 },
            indent: { left: 720 },
          })
        );
      }
    });
  });
  
  // Add best practices if available
  if (data.aiRecommendations?.bestPractices) {
    allChildren.push(
      new Paragraph({ pageBreakBefore: true }),
      new Paragraph({
        text: 'Best Practices & Recommendations',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      })
    );
    
    data.aiRecommendations.bestPractices.forEach((practice: string, index: number) => {
      allChildren.push(
        new Paragraph({
          text: `${index + 1}. ${practice}`,
          spacing: { after: 200 },
        })
      );
    });
  }
  
  // Create document with all children
  const finalDoc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: allChildren,
    }],
  });
  
  return Buffer.from(await Packer.toBuffer(finalDoc));
}

/**
 * Generate comprehensive implementation guide with all details
 */
export async function generateComprehensiveGuide(
  data: ExportData,
  format: 'pdf' | 'docx'
): Promise<Buffer> {
  if (format === 'pdf') {
    return generatePDF(data);
  } else {
    return generateWord(data);
  }
}
