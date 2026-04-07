/**
 * GOOGLE APPS SCRIPT - E-BOOK RENTAL SYSTEM BACKEND
 * Handle data from Google Sheet, Midtrans payment, and secure PDF streaming
 * 
 * DEPLOYMENT: Extensions → Apps Script → Deploy as Web app
 * EXECUTE AS: Your Google Account
 * WHO HAS ACCESS: Anyone
 */

// ========== CONFIGURATION ==========
const SHEET_ID = '1IRiYvsV1gS0ZE022hBd1TRPGOVP61DBapXxNQe9e0Fc'; // GANTI dengan ID Google Sheet
const MIDTRANS_SERVER_KEY = 'YOUR_MIDTRANS_SERVER_KEY'; // GANTI dengan Midtrans Server Key (Sandbox)
const ALLOWED_ORIGINS = ['https://dawinsight.my.id', 'http://localhost:3000'];

// ========== MAIN HANDLER ==========
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    // Log untuk debugging
    Logger.log(`Action: ${action}, Data: ${JSON.stringify(data)}`);

    switch(action) {
      case 'getEbook':
        return getEbook(data.ebookId);
      
      case 'initPayment':
        return initPayment(data);
      
      case 'checkAccess':
        return checkAccess(data.ebookId, data.email);
      
      case 'recordPurchase':
        return recordPurchase(data);
      
      case 'getDownloadLink':
        return getDownloadLink(data.ebookId, data.accessToken);
      
      case 'streamPDF':
        return streamPDF(data.ebookId, data.accessToken);
      
      default:
        return sendResponse(false, 'Unknown action: ' + action);
    }
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return sendResponse(false, 'Server error: ' + error.toString());
  }
}

// ========== EBOOK OPERATIONS ==========

/**
 * Get ebook data from Google Sheet by ID
 */
function getEbook(ebookId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ebooks');
    if (!sheet) {
      return sendResponse(false, 'Sheet "ebooks" not found');
    }

    const data = sheet.getDataRange().getValues();
    const header = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ebookId) {
        const ebook = {};
        for (let j = 0; j < header.length; j++) {
          ebook[header[j]] = data[i][j];
        }
        
        // Parse JSON fields if needed
        if (typeof ebook.highlights === 'string') {
          try {
            ebook.highlights = JSON.parse(ebook.highlights);
          } catch(e) {
            ebook.highlights = [];
          }
        }
        
        if (typeof ebook.targetAudience === 'string') {
          ebook.targetAudience = ebook.targetAudience
            .split(',')
            .map(x => x.trim());
        }

        return sendResponse(true, 'Success', { ebook: ebook });
      }
    }

    return sendResponse(false, 'E-book not found');
  } catch (error) {
    return sendResponse(false, 'Error fetching ebook: ' + error.toString());
  }
}

/**
 * Get ebook data helper (internal use)
 */
function getEbookData(ebookId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ebooks');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ebookId) {
        const header = data[0];
        const ebook = {};
        for (let j = 0; j < header.length; j++) {
          ebook[header[j]] = data[i][j];
        }
        return ebook;
      }
    }
    return null;
  } catch (error) {
    Logger.log('Error in getEbookData: ' + error.toString());
    return null;
  }
}

// ========== PAYMENT OPERATIONS ==========

/**
 * Initialize payment - Create Midtrans snap token
 */
function initPayment(data) {
  try {
    const { ebookId, email, amount, rentDays } = data;
    const ebook = getEbookData(ebookId);

    if (!ebook) {
      return sendResponse(false, 'E-book not found');
    }

    // Create Midtrans transaction
    const tokenResult = generateMidtransSnapToken({
      grossAmount: amount,
      email: email,
      ebookId: ebookId,
      orderId: 'EBOOK-' + generateRandomString(8).toUpperCase()
    });

    if (!tokenResult || !tokenResult.token) {
      const errorMsg = tokenResult ? tokenResult.error : 'Failed to create payment token';
      Logger.log('Payment token generation failed: ' + errorMsg);
      return sendResponse(false, errorMsg);
    }

    return sendResponse(true, 'Payment initialized', { snapToken: tokenResult.token });
  } catch (error) {
    const fullError = 'Payment init error: ' + error.toString();
    Logger.log(fullError);
    return sendResponse(false, fullError);
  }
}

/**
 * Generate Midtrans Snap Token
 */
function generateMidtransSnapToken(paymentData) {
  try {
    // Validate input
    if (!MIDTRANS_SERVER_KEY || MIDTRANS_SERVER_KEY === 'SB-Mid-xxxxxxx') {
      Logger.log('ERROR: MIDTRANS_SERVER_KEY not configured properly');
      return { token: null, error: 'Midtrans Server Key not configured' };
    }

    const payload = {
      transaction_details: {
        order_id: paymentData.orderId,
        gross_amount: paymentData.grossAmount
      },
      customer_details: {
        email: paymentData.email
      },
      item_details: [
        {
          id: paymentData.ebookId,
          price: paymentData.grossAmount,
          quantity: 1,
          name: 'E-Book Rental (30 days)'
        }
      ]
    };

    Logger.log('Midtrans payload: ' + JSON.stringify(payload));
    Logger.log('Midtrans server key: ' + MIDTRANS_SERVER_KEY.substring(0, 20) + '...');

    const url = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    // For production: https://app.midtrans.com/snap/v1/transactions
    
    const auth = Utilities.base64Encode(MIDTRANS_SERVER_KEY + ':');
    Logger.log('Auth header: ' + auth.substring(0, 30) + '...');
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    Logger.log('Sending request to Midtrans...');
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Midtrans response code: ' + responseCode);
    Logger.log('Midtrans response body: ' + responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch(e) {
      Logger.log('Failed to parse Midtrans response: ' + e.toString());
      return { token: null, error: 'Invalid Midtrans response: ' + responseText };
    }
    
    // Success status codes: 200, 201
    const isSuccess = (responseCode === 200 || responseCode === 201);
    Logger.log('Response is success: ' + isSuccess);
    Logger.log('Result has token: ' + (result && result.token ? 'yes' : 'no'));
    Logger.log('Token value: ' + (result && result.token ? result.token : 'null'));
    
    // Check for token in response
    if (isSuccess && result && result.token) {
      Logger.log('✓ Token created successfully: ' + result.token);
      return { token: result.token, error: null };
    } else if (result && (result.error_id || result.error_message)) {
      // Midtrans returned error in success response
      const errorMsg = result.error_message || result.errors || JSON.stringify(result);
      Logger.log('Midtrans validation error: ' + errorMsg);
      return { token: null, error: 'Midtrans validation error: ' + errorMsg };
    } else {
      // No token found or error response
      let errorMsg;
      if (!isSuccess) {
        errorMsg = (result.error_description || result.error_message || result.message || '') || 
                   ('HTTP ' + responseCode + ' from Midtrans');
      } else {
        errorMsg = 'No token in response: ' + JSON.stringify(result);
      }
      Logger.log('✗ Midtrans error: ' + errorMsg);
      return { token: null, error: errorMsg };
    }
  } catch (error) {
    const fullError = 'Midtrans token generation error: ' + error.toString();
    Logger.log(fullError);
    return { token: null, error: fullError };
  }
}

/**
 * Record purchase after successful payment
 */
function recordPurchase(data) {
  try {
    const { email, ebookId, transactionId, amount, paymentStatus } = data;
    
    const purchaseSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('purchases');
    const userSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('users');
    
    const accessToken = Utilities.getUuid();
    const accessUntil = new Date();
    accessUntil.setDate(accessUntil.getDate() + 30); // 30 days rental

    // Get PDF file ID from ebooks sheet
    const ebook = getEbookData(ebookId);
    const pdfFileId = ebook ? ebook.pdfFileId : '';

    // Record purchase ke purchases sheet
    purchaseSheet.appendRow([
      new Date().toISOString(),           // timestamp
      email,                               // email
      ebookId,                             // ebookId
      transactionId,                       // transactionId
      amount,                              // amount
      paymentStatus || 'completed',        // paymentStatus
      accessUntil.toISOString(),          // accessUntil
      accessToken,                         // accessToken (UUID)
      true,                                // isActive
      pdfFileId                            // pdfFileId (untuk streaming)
    ]);

    // Update atau create user record
    const userDataRange = userSheet.getDataRange().getValues();
    let userFound = false;
    
    for (let i = 1; i < userDataRange.length; i++) {
      if (userDataRange[i][0] === email) {
        // Update existing user
        userSheet.getRange(i + 1, 3).setValue(userDataRange[i][2] + 1); // purchaseCount
        userSheet.getRange(i + 1, 4).setValue(userDataRange[i][3] + amount); // totalSpent
        userSheet.getRange(i + 1, 6).setValue(new Date().toISOString()); // lastPurchase
        userFound = true;
        break;
      }
    }

    if (!userFound) {
      // Create new user
      userSheet.appendRow([
        email,                              // email
        email.split('@')[0],                // name (dari email)
        1,                                  // purchaseCount
        amount,                             // totalSpent
        new Date().toISOString(),          // registrationDate
        new Date().toISOString()           // lastPurchase
      ]);
    }

    return sendResponse(true, 'Purchase recorded', { 
      accessToken: accessToken,
      accessUntil: accessUntil.toISOString()
    });
  } catch (error) {
    return sendResponse(false, 'Record purchase error: ' + error.toString());
  }
}

// ========== ACCESS CONTROL ==========

/**
 * Check if user has access to ebook
 */
function checkAccess(ebookId, email) {
  try {
    const purchaseSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('purchases');
    const data = purchaseSheet.getDataRange().getValues();
    const now = new Date();

    for (let i = 1; i < data.length; i++) {
      const purchaseEmail = data[i][1];
      const purchaseEbookId = data[i][2];
      const accessUntil = new Date(data[i][6]);
      const isActive = data[i][8];
      const accessToken = data[i][7];

      if (purchaseEmail === email && 
          purchaseEbookId === ebookId && 
          isActive && 
          accessUntil > now) {
        return sendResponse(true, 'User has access', { 
          hasAccess: true,
          accessToken: accessToken,
          accessUntil: accessUntil.toISOString()
        });
      }
    }

    return sendResponse(true, 'No access', { hasAccess: false });
  } catch (error) {
    return sendResponse(false, 'Access check error: ' + error.toString());
  }
}

/**
 * Get download link - Returns GAS stream URL
 * Frontend akan gunakan ini untuk download
 */
function getDownloadLink(ebookId, accessToken) {
  try {
    // Validate access token dulu
    if (!validateAccessToken(ebookId, accessToken)) {
      return sendResponse(false, 'Invalid atau expired access token');
    }

    // Get current deployment ID
    // INFO: Anda perlu update ini dengan deployment ID yang actual
    const deploymentId = 'YOUR_GAS_DEPLOYMENT_ID';
    
    // URL untuk stream PDF dengan token validation
    const streamUrl = `https://script.google.com/macros/s/${deploymentId}/usercopy?action=streamPDF&ebookId=${ebookId}&token=${accessToken}`;
    
    return sendResponse(true, 'Download link ready', { 
      downloadUrl: streamUrl,
      expiresIn: '30 minutes'
    });
  } catch (error) {
    return sendResponse(false, 'Get download link error: ' + error.toString());
  }
}

/**
 * Validate access token - internal helper
 */
function validateAccessToken(ebookId, accessToken) {
  try {
    const purchaseSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('purchases');
    const data = purchaseSheet.getDataRange().getValues();
    const now = new Date();

    for (let i = 1; i < data.length; i++) {
      const token = data[i][7];
      const tokenEbookId = data[i][2];
      const accessUntil = new Date(data[i][6]);
      const isActive = data[i][8];

      if (token === accessToken && 
          tokenEbookId === ebookId && 
          isActive && 
          accessUntil > now) {
        return true;
      }
    }
    return false;
  } catch (error) {
    Logger.log('Validation error: ' + error.toString());
    return false;
  }
}

// ========== PDF STREAMING (PROTECTED) ==========

/**
 * Stream PDF dengan access control
 * HANYA bisa diakses jika token valid
 * 
 * URL: https://script.google.com/macros/s/[ID]/usercopy?action=streamPDF&ebookId=...&token=...
 */
function streamPDF(ebookId, accessToken) {
  try {
    // 1. Validate access token
    if (!validateAccessToken(ebookId, accessToken)) {
      return HtmlService.createHtmlOutput(
        '<h1>❌ Akses Ditolak</h1>' +
        '<p>Token tidak valid, sudah expired, atau e-book salah.</p>' +
        '<p>Silakan sewa kembali atau cek akses Anda.</p>'
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // 2. Get ebook data dan PDF file ID
    const ebook = getEbookData(ebookId);
    if (!ebook || !ebook.pdfFileId) {
      return HtmlService.createHtmlOutput(
        '<h1>❌ File Tidak Ditemukan</h1>' +
        '<p>PDF untuk e-book ini tidak tersedia.</p>'
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // 3. Get file dari Google Drive
    try {
      const file = DriveApp.getFileById(ebook.pdfFileId);
      const blob = file.getBlob();
      
      // Return PDF dengan proper headers
      return blob
        .setContentTypeFromExtension()
        .getAs('application/pdf');
    } catch (driveError) {
      Logger.log('Drive error: ' + driveError.toString());
      return HtmlService.createHtmlOutput(
        '<h1>❌ Error Membuka File</h1>' +
        '<p>Terjadi kesalahan saat mengakses file PDF.</p>'
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (error) {
    Logger.log('Stream PDF error: ' + error.toString());
    return HtmlService.createHtmlOutput(
      '<h1>❌ Server Error</h1>' +
      '<p>Terjadi kesalahan di server. Hubungi support.</p>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Handle GET requests (untuk streaming)
 * Google Apps Script akan call doGet untuk file streaming
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ebookId = e.parameter.ebookId;
    const token = e.parameter.token;

    if (action === 'streamPDF' && ebookId && token) {
      return streamPDF(ebookId, token);
    }

    return HtmlService.createHtmlOutput(
      '<h1>Invalid Request</h1><p>Action atau parameter tidak valid.</p>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1><p>' + error.toString() + '</p>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Send JSON response
 */
function sendResponse(success, message, data = {}) {
  const response = {
    success: success,
    error: success ? null : message,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generate random string
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ========== TESTING FUNCTIONS ==========

/**
 * Test function - Run ini dari GAS editor untuk debug
 */
function testGetEbook() {
  const result = getEbook('ebook-001');
  Logger.log('Test result: ' + result.getContent());
}

/**
 * Test streaming validation
 */
function testStreamValidation() {
  // Get test token dari sheet
  const purchaseSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('purchases');
  const data = purchaseSheet.getDataRange().getValues();
  
  if (data.length > 1) {
    const testToken = data[1][7];
    const testEbookId = data[1][2];
    
    const isValid = validateAccessToken(testEbookId, testToken);
    Logger.log('Test token valid: ' + isValid);
  }
}
