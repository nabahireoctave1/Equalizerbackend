const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QrcodeImage = require('qrcode');
const pino = require('pino');
const fs= require('fs')

const originalWrite = process.stdout.write;
process.stdout.write = function (string, encoding, fd) {
    if (typeof string === 'string' && string.includes('Closing session')) {
        return; 
    }
    return originalWrite.apply(process.stdout, arguments);
};

const logger = pino({ level: 'silent' });

let latestQR = null;
let isconnected = false;
let sock = null;

async function StartWhattApp(io) {
    let globalIo = io; 
    const sessionPath = 'system_main_session';
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath, logger);
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: logger,
        downloadHistoryOptions: {
            maxChat: 0,
            maxMessages: 0
        },
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            latestQR = await QrcodeImage.toDataURL(qr);
            isconnected = false;
            globalIo.to('super_admin_room').emit('whatsapp_gateway_status', { status: "scan_required", qr: latestQR });
        }

        if (connection === 'open') {
            isconnected = true;
            latestQR = null;
            globalIo.to('super_admin_room').emit('whatsapp_gateway_status', { status: "connected" });
        }

        if (connection === 'close') {
            isconnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                StartWhattApp(globalIo);
                
            } else {
                fs.rm(sessionPath,{recursive:true})
                latestQR = null;
                globalIo.to('super_admin_room').emit('whatsapp_gateway_status', { status: "scan_required", qr: null });
                StartWhattApp(globalIo);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

function getWhatsappStatus() {
    if (isconnected) return { status: 'connected', qr: null };
    if (latestQR) return { status: "scan_required", qr: latestQR }; 
    return { status: "Loading...", qr: null };
}

const SendWhattappmessage = async (phonenumber, message, email) => {
    try {
        if (!sock) return false;

        let cleanedphoneno = phonenumber.replace('+', '').trim();
        if (cleanedphoneno.startsWith('0')) {
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