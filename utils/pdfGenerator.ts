import { CalculationStaff } from '@/types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateTipsPDF(
  staffMembers: CalculationStaff[],
  totalAmount: number,
  mealPeriod: 'lunch' | 'dinner',
  date: string
) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mealPeriodText = mealPeriod === 'lunch' ? 'Lunch' : 'Dinner';

  // Generate HTML for the PDF with dotted borders for cutting
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
          }
          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
          }
          .tip-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0;
            page-break-inside: avoid;
          }
          .tip-cell {
            border: 2px dashed #999;
            padding: 20px;
            min-height: 120px;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .tip-cell .name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          }
          .tip-cell .info {
            font-size: 14px;
            color: #666;
            margin: 6px 0;
            line-height: 1.6;
          }
          .tip-cell .amount {
            font-size: 22px;
            font-weight: bold;
            color: #2E7D32;
            margin-top: 12px;
          }
          .tip-cell .role {
            color: #1976D2;
            font-weight: 600;
          }
          @media print {
            body {
              padding: 10px;
            }
            .tip-cell {
              page-break-inside: avoid;
            }
          }
          .scissors-icon {
            text-align: center;
            color: #999;
            font-size: 18px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tip Distribution - ${mealPeriodText}</h1>
          <p>${formattedDate}</p>
          <p>Total Tips: $${totalAmount.toFixed(2)}</p>
        </div>
        
        <div class="scissors-icon">✂️ Cut along dotted lines ✂️</div>
        
        <div class="tip-grid">
          ${staffMembers
            .map(
              (staff) => `
            <div class="tip-cell">
              <div class="name">${staff.staffName}</div>
              <div class="info"><span class="role">${staff.role.name}</span></div>
              <div class="info">Shift: ${staff.customPercentage}%</div>
              <div class="info">Pool: ${staff.pool === 'pool1' ? '1 (97%)' : '2 (3%)'}</div>
              <div class="amount">$${staff.tipAmount.toFixed(2)}</div>
            </div>
          `
            )
            .join('')}
        </div>
        
        <div class="scissors-icon" style="margin-top: 20px;">✂️</div>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Share/Save the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Tips PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
