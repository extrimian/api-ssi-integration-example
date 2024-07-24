import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiSSIService } from './services/api-ssi.service';

@Controller("api-ssi")
export class IssuerController {

    constructor(private readonly ssiService: ApiSSIService) { }

    @Put('read-qr')
    async interpretWACIFlow(@Body() params: { did: string, message: string }) {
        this.ssiService.interpretWACIFlow(params)
    }

    @Get("presentation-qr")
    async getInvitationCode(@Query("did") did: string): Promise<{ invitationId: string, oobContentData: string }> {
        return await this.ssiService.getPresentationQR({
            did: did,
            inputDescriptors: [
                {
                    id: "PopUpCityCredential",
                    name: "PopUpCityCredential",
                    constraints: {
                        fields: [
                            {
                                path: [
                                    "$.credentialSubject.category"
                                ],
                                filter: {
                                    type: "string"
                                }
                            }
                        ]
                    }
                }
            ],
            issuer: {
                name: "Issuer Name",
                styles: {
                    thumbnail: {
                        uri: "https://dol.wa.com/logo.png",
                        alt: "Issuer Name"
                    },
                    hero: {
                        uri: "https://dol.wa.com/alumnos.png",
                        alt: "Image Description"
                    },
                    background: {
                        color: "#ff0000"
                    },
                    text: {
                        color: "#d4d400"
                    }
                }
            }
        })
    }

    @Get("issuance-qr")
    async getIssuanceQRCode(@Query("did") did: string): Promise<{ invitationId: string, oobContentData: string }> {
        console.log(did)
        return await this.ssiService.getIssuanceQR({
            "did": did,
            "vc": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1",
                    "https://w3id.org/security/bbs/v1"
                ],
                "id": "http://example.edu/credentials/3333333",
                "type": ["VerifiableCredential", "AlumniCredential"],
                "issuer": "did:quarkid:zksync:EiAauMsrxbK8t670y8l8GKYMEU6UUuxZDwly0wHXoL2I_Q",
                "issuanceDate": "01-01-2023",
                "credentialSubject": {
                    "givenName": "Jhon",
                    "familyName": "Does"
                }
            } as any,
            "outputDescriptor": {
                "id": "alumni_credential_output",
                "schema": "https://schema.org/EducationalOccupationalCredential",
                "display": {
                    "title": {
                        "path": ["$.name", "$.vc.name"],
                        "fallback": "Alumni Credential"
                    },
                    "subtitle": {
                        "path": ["$.class", "$.vc.class"],
                        "fallback": "Alumni"
                    },
                    "description": {
                        "text": "Credencial que permite validar que es alumno del establecimiento"
                    },
                    "properties": [
                        {
                            "path": [
                                "$.credentialSubject.givenName"
                            ],
                            "fallback": "-",
                            "label": "Nombre",
                            "schema": {
                                "type": "string"
                            }
                        },
                        {
                            "path": [
                                "$.credentialSubject.familyName"
                            ],
                            "fallback": "-",
                            "label": "Apellido",
                            "schema": {
                                "type": "string"
                            }
                        }
                    ]
                },
                "styles": {
                    "background": {
                        "color": "#ff0000"
                    },
                    "thumbnail": {
                        "uri": "https://dol.wa.com/logo.png",
                        "alt": "Universidad Nacional"
                    },
                    "hero": {
                        "uri": "https://dol.wa.com/alumnos.png",
                        "alt": "Alumnos de la universidad"
                    },
                    "text": {
                        "color": "#d4d400"
                    }
                }
            },
            "issuer": {
                "name": "Universidad Nacional",
                "styles": {
                    "thumbnail": {
                        "uri": "https://dol.wa.com/logo.png",
                        "alt": "Universidad Nacional"
                    },
                    "hero": {
                        "uri": "https://dol.wa.com/alumnos.png",
                        "alt": "Alumnos de la universidad"
                    },
                    "background": {
                        "color": "#ff0000"
                    },
                    "text": {
                        "color": "#d4d400"
                    }
                }
            }
        })
    }

    @Put("create-did")
    async createDID(): Promise<{ did: string }> {
        return await this.ssiService.createDID();
    }
}
