import fs from 'fs';
import path from 'path';

const { dirname } = import.meta;

export function getPublicKey() {
    return (
        process.env.PUBLIC_KEY ||
        fs.readFileSync(path.join(dirname, 'id_rsa_pub.pem'), 'utf8')
    );
}

export function getPrivateKey() {
    return (
        process.env.PRIVATE_KEY ||
        fs.readFileSync(path.join(dirname, 'id_rsa_priv.pem'), 'utf8')
    );
}
