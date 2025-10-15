import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import type { ScopingSession, CustomerProfile, DeploymentChecklist, QuestionnaireResponse } from '@shared/schema';

export type ExportTemplate = 'comprehensive' | 'executive' | 'technical' | 'checklist-only';

interface ExportData {
  session: ScopingSession & { customer?: CustomerProfile };
  responses: QuestionnaireResponse[];
  checklist: DeploymentChecklist[];
  recommendedDocs?: any[];
  aiRecommendations?: any;
}

// Portnox brand colors
const COLORS = {
  portnoxBlue: rgb(0, 0.45, 0.71), // #0073B5
  darkGray: rgb(0.2, 0.2, 0.2),
  lightGray: rgb(0.5, 0.5, 0.5),
  white: rgb(1, 1, 1),
  red: rgb(0.8, 0, 0),
  orange: rgb(1, 0.6, 0),
  green: rgb(0, 0.6, 0),
};

/**
 * Generate Executive Summary PDF - High-level overview for decision makers
 */
export async function generateExecutiveSummaryPDF(data: ExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Cover page
  let page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let yPos = height - 80;
  
  page.drawText('PORTNOX', {
    x: 50, y: yPos, size: 32,
    font: titleFont, color: COLORS.portnoxBlue,
  });
  
  page.drawLine({
    start: { x: 50, y: yPos - 10 },
    end: { x: width - 50, y: yPos - 10 },
    thickness: 3, color: COLORS.portnoxBlue,
  });
  
  yPos -= 70;
  
  page.drawText('Executive Summary', {
    x: 50, y: yPos, size: 24,
    font: headingFont, color: COLORS.darkGray,
  });
  
  page.drawText('Portnox NAC Deployment Overview', {
    x: 50, y: yPos - 30, size: 16,
    font: bodyFont, color: COLORS.lightGray,
  });
  
  yPos -= 100;
  
  const customerName = data.session.customer?.companyName || 'Customer';
  page.drawText(`Prepared for: ${customerName}`, {
    x: 50, y: yPos, size: 14,
    font: bodyFont, color: COLORS.darkGray,
  });
  
  page.drawText(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: 50, y: yPos - 25, size: 12,
    font: bodyFont, color: COLORS.lightGray,
  });
  
  yPos -= 80;
  
  page.drawText('Overview', {
    x: 50, y: yPos, size: 18,
    font: headingFont, color: COLORS.portnoxBlue,
  });
  
  yPos -= 30;
  
  const overviewText = [
    `This document provides an executive-level summary of the Portnox Network`,
    `Access Control deployment for ${customerName}. The assessment has`,
    `identified key requirements, risks, and recommendations to ensure a`,
    `successful implementation.`
  ];
  
  overviewText.forEach(line => {
    page.drawText(line, {
      x: 50, y: yPos, size: 11,
      font: bodyFont, color: COLORS.darkGray,
    });
    yPos -= 18;
  });
  
  yPos -= 20;
  
  page.drawText('Key Metrics', {
    x: 50, y: yPos, size: 18,
    font: headingFont, color: COLORS.portnoxBlue,
  });
  
  yPos -= 30;
  
  const metrics = [
    { label: 'Total Checklist Items', value: data.checklist.length.toString() },
    { label: 'Critical Priority Items', value: data.checklist.filter(i => i.priority === 'high').length.toString() },
    { label: 'Documentation References', value: (data.recommendedDocs?.length || 0).toString() },
    { label: 'Estimated Timeline', value: '6-8 weeks' }, // Could be calculated
  ];
  
  metrics.forEach(({ label, value }) => {
    page.drawText(`${label}:`, {
      x: 70, y: yPos, size: 11,
      font: headingFont, color: COLORS.darkGray,
    });
    
    page.drawText(value, {
      x: 280, y: yPos, size: 11,
      font: bodyFont, color: COLORS.darkGray,
    });
    
    yPos -= 22;
  });
  
  yPos -= 20;
  
  page.drawText('Key Recommendations', {
    x: 50, y: yPos, size: 18,
    font: headingFont, color: COLORS.portnoxBlue,
  });
  
  yPos -= 30;
  
  const recommendations = data.aiRecommendations?.recommendations?.slice(0, 5) || [
    'Complete network infrastructure assessment',
    'Configure identity provider integration',
    'Implement phased deployment approach',
    'Establish comprehensive testing plan',
    'Provide end-user training'
  ];
  
  recommendations.forEach((rec: any, idx: number) => {
    if (yPos < 100) {
      page = pdfDoc.addPage([612, 792]);
      yPos = height - 80;
    }
    
    const recText = typeof rec === 'string' ? rec : String(rec);
    const shortRec = recText.length > 70 ? recText.substring(0, 67) + '...' : recText;
    
    page.drawText(`${idx + 1}. ${shortRec}`, {
      x: 70, y: yPos, size: 11,
      font: bodyFont, color: COLORS.darkGray,
    });
    
    yPos -= 22;
  });
  
  // Footer
  const pages = pdfDoc.getPages();
  pages.forEach((pg, index) => {
    pg.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width - 150, y: 30, size: 10,
      font: bodyFont, color: COLORS.lightGray,
    });
    
    pg.drawText('Confidential', {
      x: 50, y: 30, size: 10,
      font: bodyFont, color: COLORS.lightGray,
    });
  });
  
  return Buffer.from(await pdfDoc.save());
}

/**
 * Generate Technical Deep-Dive PDF - Detailed technical implementation guide
 */
export async function generateTechnicalDeepDivePDF(data: ExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  let page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let yPos = height - 80;
  
  // Cover page
  page.drawText('PORTNOX', {
    x: 50, y: yPos, size: 32,
    font: titleFont, color: COLORS.portnoxBlue,
  });
  
  page.drawLine({
    start: { x: 50, y: yPos - 10 },
    end: { x: width - 50, y: yPos - 10 },
    thickness: 3, color: COLORS.portnoxBlue,
  });
  
  yPos -= 70;
  
  page.drawText('Technical Deep-Dive', {
    x: 50, y: yPos, size: 24,
    font: headingFont, color: COLORS.darkGray,
  });
  
  page.drawText('Comprehensive Implementation Guide', {
    x: 50, y: yPos - 30, size: 16,
    font: bodyFont, color: COLORS.lightGray,
  });
  
  yPos -= 100;
  
  page.drawText(`Prepared for: ${data.session.customer?.companyName || 'Customer'}`, {
    x: 50, y: yPos, size: 14,
    font: bodyFont, color: COLORS.darkGray,
  });
  
  page.drawText(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: 50, y: yPos - 25, size: 12,
    font: bodyFont, color: COLORS.lightGray,
  });
  
  page = pdfDoc.addPage([612, 792]);
  yPos = height - 80;
  
  page.drawText('Infrastructure Assessment', {
    x: 50, y: yPos, size: 20,
    font: headingFont, color: COLORS.portnoxBlue,
  });
  
  yPos -= 40;
  
  const infraDetails = data.responses.reduce((acc, resp) => {
    if (resp.response) {
      try {
        const value = typeof resp.response === 'string' ? JSON.parse(resp.response as string) : resp.response;
        acc[resp.question] = Array.isArray(value) ? value : [value];
      } catch {
        acc[resp.question] = [resp.response];
      }
    }
    return acc;
  }, {} as Record<string, any[]>);
  
  const keyFields = ['wiredSwitchVendors', 'wirelessVendors', 'identityProviders', 'deploymentType'];
  keyFields.forEach(fieldId => {
    if (infraDetails[fieldId] && infraDetails[fieldId].length > 0) {
      if (yPos < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPos = height - 80;
      }
      
      const label = fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      page.drawText(`${label}:`, {
        x: 70, y: yPos, size: 12,
        font: headingFont, color: COLORS.darkGray,
      });
      
      yPos -= 22;
      
      infraDetails[fieldId].forEach((item: any) => {
        if (yPos < 80) {
          page = pdfDoc.addPage([612, 792]);
          yPos = height - 80;
        }
        
        const itemText = typeof item === 'string' ? item : JSON.stringify(item);
        page.drawText(`• ${itemText}`, {
          x: 90, y: yPos, size: 10,
          font: bodyFont, color: COLORS.darkGray,
        });
        
        yPos -= 18;
      });
      
      yPos -= 10;
    }
  });
  
  page = pdfDoc.addPage([612, 792]);
  yPos = height - 80;
  
  page.drawText('Detailed Implementation Checklist', {
    x: 50, y: yPos, size: 20,
    font: headingFont, color: COLORS.portnoxBlue,
  });
  
  yPos -= 40;
  
  const categorizedChecklist = data.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DeploymentChecklist[]>);
  
  Object.entries(categorizedChecklist).forEach(([category, items]) => {
    if (yPos < 150) {
      page = pdfDoc.addPage([612, 792]);
      yPos = height - 80;
    }
    
    page.drawText(category, {
      x: 60, y: yPos, size: 14,
      font: headingFont, color: COLORS.portnoxBlue,
    });
    
    yPos -= 25;
    
    items.forEach((item) => {
      if (yPos < 120) {
        page = pdfDoc.addPage([612, 792]);
        yPos = height - 80;
      }
      
      const priorityColor = item.priority === 'high' ? COLORS.red : 
                           item.priority === 'medium' ? COLORS.orange : COLORS.green;
      
      page.drawText(`[${item.priority?.toUpperCase()}]`, {
        x: 80, y: yPos, size: 9,
        font: bodyFont, color: priorityColor,
      });
      
      const titleText = item.itemTitle.length > 55 ? 
        item.itemTitle.substring(0, 52) + '...' : item.itemTitle;
      
      page.drawText(titleText, {
        x: 140, y: yPos, size: 11,
        font: headingFont, color: COLORS.darkGray,
      });
      
      yPos -= 18;
      
      if (item.itemDescription) {
        const descLines = wrapText(item.itemDescription, 65);
        descLines.slice(0, 2).forEach(line => {
          if (yPos < 80) {
            page = pdfDoc.addPage([612, 792]);
            yPos = height - 80;
          }
          
          page.drawText(line, {
            x: 100, y: yPos, size: 9,
            font: bodyFont, color: COLORS.lightGray,
          });
          
          yPos -= 14;
        });
      }
      
      yPos -= 10;
    });
    
    yPos -= 15;
  });
  
  // Footer
  const pages = pdfDoc.getPages();
  pages.forEach((pg, index) => {
    pg.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width - 150, y: 30, size: 10,
      font: bodyFont, color: COLORS.lightGray,
    });
  });
  
  return Buffer.from(await pdfDoc.save());
}

/**
 * Generate Checklist-Only PDF - Simple checklist for printing
 */
export async function generateChecklistOnlyPDF(data: ExportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let yPos = height - 60;
  
  page.drawText('Portnox Deployment Checklist', {
    x: 50, y: yPos, size: 20,
    font: titleFont, color: COLORS.portnoxBlue,
  });
  
  page.drawText(`${data.session.customer?.companyName || 'Customer'}`, {
    x: 50, y: yPos - 25, size: 12,
    font: bodyFont, color: COLORS.darkGray,
  });
  
  yPos -= 60;
  
  const categorizedChecklist = data.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DeploymentChecklist[]>);
  
  Object.entries(categorizedChecklist).forEach(([category, items]) => {
    if (yPos < 100) {
      page = pdfDoc.addPage([612, 792]);
      yPos = height - 60;
    }
    
    page.drawText(category, {
      x: 50, y: yPos, size: 14,
      font: headingFont, color: COLORS.darkGray,
    });
    
    yPos -= 25;
    
    items.forEach((item) => {
      if (yPos < 80) {
        page = pdfDoc.addPage([612, 792]);
        yPos = height - 60;
      }
      
      // Checkbox
      page.drawRectangle({
        x: 60, y: yPos - 10, width: 10, height: 10,
        borderColor: COLORS.darkGray, borderWidth: 1,
      });
      
      const titleText = item.itemTitle.length > 60 ? 
        item.itemTitle.substring(0, 57) + '...' : item.itemTitle;
      
      page.drawText(titleText, {
        x: 80, y: yPos, size: 10,
        font: bodyFont, color: COLORS.darkGray,
      });
      
      yPos -= 20;
    });
    
    yPos -= 15;
  });
  
  // Footer
  const pages = pdfDoc.getPages();
  pages.forEach((pg, index) => {
    pg.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width / 2 - 30, y: 30, size: 10,
      font: bodyFont, color: COLORS.lightGray,
    });
  });
  
  return Buffer.from(await pdfDoc.save());
}

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine) lines.push(currentLine.trim());
  
  return lines;
}

/**
 * Export with specified template
 */
export async function exportWithTemplate(
  data: ExportData,
  template: ExportTemplate
): Promise<Buffer> {
  switch (template) {
    case 'executive':
      return generateExecutiveSummaryPDF(data);
    case 'technical':
      return generateTechnicalDeepDivePDF(data);
    case 'checklist-only':
      return generateChecklistOnlyPDF(data);
    case 'comprehensive':
    default:
      const { generatePDF } = await import('./export-service.js');
      return generatePDF(data);
  }
}
