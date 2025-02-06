import type { PayloadValues, VPayload } from '$lib/@types/types'

export function parsePayload(payload: string): PayloadValues {
    const pV = {} as PayloadValues
    const buf = Buffer.from(payload.replace('0x', ''), 'hex')
    pV.height = buf.readBigUInt64BE(0x17)
    pV.chainid = buf.readBigUInt64BE(0xf)
    pV.systemid = buf.readUint8(0xe)

    const timeBuff = Buffer.alloc(8)
    buf.copy(timeBuff, 2, 0x8, 0xe)
    pV.timestamp = timeBuff.readBigUInt64BE(0)
    const pLen = buf.readUint16BE(0x6)

    pV.payloads = []
    const value = Buffer.alloc(0x20)
    let pos = 0

    for (let i = 0; i < pLen; i++) {
        pos += 0x20
        buf.copy(value, 2, pos + 0x2)
        pV.payloads.push({
            typ: buf.readUint16BE(pos),
            value: '0x' + value.toString('hex')
        } as VPayload)
    }

    return pV
} 