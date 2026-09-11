const {
    default: makeWASocket,useMultiFileAuthState,
    DisconnectReason,fetchLatestWaWebVersion
} = require('@whiskeysockets/baileys');
const QrcodeImage = require('qrcode');
const pino = require('pino');
const fs= require('fs')
const logger = pino({ level: 'silent' });


const originalWrite = process.stdout.write;
process.stdout.write = function (string, encoding, fd) {
    if (typeof string === 'string' && string.includes('Closing session')) {
        return; 
    }
    return originalWrite.apply(process.stdout, arguments);
};


let latestQR = null;
let isconnected = false;
let sock = null;
 const sessionPath = 'system_main_session';

async function StartWhattApp() {
    const { state, saveCreds} = await useMultiFileAuthState(sessionPath);
    const {version,isLatest}=await fetchLatestWaWebVersion();
    sock = makeWASocket({
        auth: state, version:version,
         printQRInTerminal: false,
        logger: logger,
         downloadHistoryOptions: {
            maxChat: 0,
            maxMessages: 0
        },
        syncFullHistory: false, 
        markOnlineOnConnect:false
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr} = update;
        if (qr) { 
            latestQR = await QrcodeImage.toDataURL(qr);
            isconnected = false;
          
        }

        if (connection === 'open') {
            isconnected = true;
            latestQR = null;
          
        }

        if (connection === 'close') {
            isconnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            

            if (shouldReconnect) {
                StartWhattApp();
                
            } 
        }
    });

    sock.ev.on('creds.update', saveCreds);
}


function getWhatsappStatus() {
    if (isconnected) return { status: 'connected', qr: null };
    if (latestQR) return { status: "scan_required", qr: latestQR }; 
    return { status: "null", qr: null };
}

const SendWhattappmessage = async (phonenumber, message, email) => {
    try {
        if (!sock) return false;

        let cleanedphoneno = phonenumber?.replace('+', '').trim();
        if (cleanedphoneno?.startsWith('0')) {
            cleanedphoneno = '250' + cleanedphoneno.substring(1);
        }

        const recipientjid = `${cleanedphoneno}@s.whatsapp.net`;
        const [result] = await sock.onWhatsApp(recipientjid);
        if (result && result.exists === true) {
            await sock.sendMessage(recipientjid, { text: message });
        } else {
            // Logic yo kohereza email izaza hano
        }
    } catch (err) {
        console.log("Err in send whatsapp message controller or email", err.message);
    }
};

module.exports = {
    StartWhattApp,
    getWhatsappStatus,
    SendWhattappmessage
};