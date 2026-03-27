import crypto from 'crypto';

function genKeyPair() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, 
        publicKeyEncoding: {
            type: 'pkcs1', 
            format: 'pem' 
        },
        privateKeyEncoding: {
            type: 'pkcs1', 
            format: 'pem' 
        }
    });

    console.log('-----------------PUBLIC KEY-----------------');
    console.log(keyPair.publicKey);
    console.log('-----------------PUBLIC KEY-----------------\n\n\n');
    
    console.log('-----------------PRIVATE KEY-----------------');    
    console.log(keyPair.privateKey);
    console.log('-----------------PRIVATE KEY-----------------\n\n\n');

}

genKeyPair();