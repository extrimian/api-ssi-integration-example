import { VerifiableCredential } from '@extrimian/vc-core';
import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class ApiSSIService {
    baseUrl: string = "https://sandbox-ssi.extrimian.com/v1";
    websocket: string = "https://sandbox-ssi-ws.extrimian.com";
    didMethod: string = "did:quarkid";
    webhookUrl: string = "https://1e32-181-231-217-21.ngrok-free.app/webhook";

    async getIssuanceQR(params: {
        did: string,
        vc: VerifiableCredential,
        outputDescriptor: OutputDescriptor,
        issuer: Issuer
    }) {
        const result = await axios.put(`${this.baseUrl}/credentialsbbs/wacioob`, params);
        return result.data;
    }

    async getPresentationQR(params: {
        did: string,
        inputDescriptors: InputDescriptor[],
        issuer: Issuer
    }) {
        const result = await axios.put(`${this.baseUrl}/credentialsbbs/waci/oob/presentation`, params);
        return result.data;
    }

    async interpretWACIFlow(params: {
        did: string,
        message: string,
    }) {
        const result = await axios.put(`${this.baseUrl}/credentialsbbs/waci`, params);
        return result.data;
    }

    async createDID(): Promise<{ did: string }> {
        const result = await axios.put(`${this.baseUrl}/dids/quarkid`, {
            websocket: this.websocket,
            webhookUrl: this.webhookUrl,
            didMethod: this.didMethod,
        })

        return { did: result.data.did }
    }
}

export interface Display {
    title: {
        path: string[],
        fallback: string
    },
    subtitle: {
        path: string[],
        fallback: string
    },
    description: {
        text: string
    },
    properties:
    {
        path: string[],
        fallback: string,
        label: string,
        schema: {
            type: string
        }
    }[]
}

export interface OutputDescriptor {
    id: string,
    schema: string,
    display: Display,
    styles: Style,
}

export interface Style {
    background: {
        color: string
    },
    thumbnail: {
        uri: string,
        alt: string
    },
    hero: {
        uri: string,
        alt: string
    },
    text: {
        color: string
    }
}

export interface Issuer {
    name: string,
    styles: {
        thumbnail: {
            uri: string,
            alt: string
        },
        hero: {
            uri: string,
            alt: string
        },
        background: {
            color: string
        },
        text: {
            color: string
        }
    }
}

export interface InputDescriptor {
    id: string,
    name: string,
    constraints: {
        fields: {
            path: string[],
            filter: {
                type: string
            }
        }[]
    }
}