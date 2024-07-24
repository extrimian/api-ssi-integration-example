# Explicación del repo
Este repo representa la API intermedia expuesta que consume por detras al API SSI. Todos los request a la API SSI se realizan desde el archivo `api-ssi.service.ts`, que se encuentra en este repo.
Hay unos request de ejemplo en este repo en los archivos `request-api-ssi.http` y `request-backend.http`. 

- `request-api-ssi.http` tiene request armados directamente hacia la API SSI donde se muestra un ejemplo de como crear el QR de invitación para la **verificación de credenciales** usando directamente la API. 
- `request-backend.http` contiene request hacia la API intermedia (la api que levanta este repo) y que luego genera internamente los request hacia la API SSI.

Para ver el ejemplo del request para generar el QR de verificación, alcanza con revisar el archivo `request-api-ssi.http`.

## Cosas a considerar
Este repo representa la API Intermedia, que debe estar entre el Frontend y la API SSI. Esta api debe exponer un webhook para que la API de SSI le comunique los eventos, especialmente el del resultado de un flujo de verificación. Se adjunta a continuación el enlace hacia la [Documentación del webhook](webhook.md).

Si el proyecto se corre en localhost, es conveniente utilizar una herramienta como ngrok para facilitar el acceso desde la API de Sandbox al webhook de esta API intermedia.

Para eso se debe levantar el ngrok en el puerto expuesto por esta API (por defecto el 3006) y al momento de crear un DID en la API SSI, utilizar la url expuesta por ngrok y agregar `/webhook`. 
Por ejemplo, si el ngrok libera la url `https://1e32-181-231-217-21.ngrok-free.app`, se debe configurar el webhookUrl con `https://1e32-181-231-217-21.ngrok-free.app/webhook`
```
NOTA IMPORTANTE: Esta misma url puede configurarse en el archivo api-ssi.service.ts, en las primeras líneas del código

baseUrl: string = "https://sandbox-ssi.extrimian.com/v1";
websocket: string = "https://sandbox-ssi-ws.extrimian.com";
didMethod: string = "did:quarkid";
webhookUrl: string = "https://1e32-181-231-217-21.ngrok-free.app";

Al definir correctamente el webhookUrl en el archivo api-ssi.service.ts y crear un DID desde esta api intermedia, se creará el did correctamente para que los eventos de ese did se notifiquen a este webhook configurado, ya que al crear el DID se utiliza esta porción de código:

async createDID(): Promise<{ did: string }> {
      const result = await axios.put(`${this.baseUrl}/dids/quarkid`, {
          websocket: this.websocket,
          webhookUrl: this.webhookUrl,
          didMethod: this.didMethod,
      })

      return { did: result.data.did }
  }
```

# Como obtener un QR para la verificación usando la API SSI

Para generar el QR de verificación, se debe consumir el endpoint `${this.baseUrl}/credentialsbbs/waci/oob/presentation`. Para la variable `this.baseUrl` puede usarse el ambiente de sandbox: `https://sandbox-ssi.extrimian.com/v1`, lo que daría como resultado el endpoint `https://sandbox-ssi.extrimian.com/v1/credentialsbbs/waci/oob/presentation`.

En http request que debe enviarse, junto con su body, es:

```
PUT https://sandbox-ssi.extrimian.com/ HTTP/1.1
Content-Type: application/json

{
    "did": "did",
    "inputDescriptors": [
        {
            "id": "PopUpCityCredential",
            "name": "PopUpCityCredential",
            "constraints": {
                "fields": [
                    {
                        "path": [
                            "$.credentialSubject.category"
                        ],
                        "filter": {
                            "type": "string"
                        }
                    }
                ]
            }
        }
    ],
    "issuer": {
        "name": "Issuer Name",
        "styles": {
            "thumbnail": {
                "uri": "https://dol.wa.com/logo.png",
                "alt": "Issuer Name"
            },
            "hero": {
                "uri": "https://dol.wa.com/alumnos.png",
                "alt": "Image Description"
            },
            "background": {
                "color": "#ff0000"
            },
            "text": {
                "color": "#d4d400"
            }
        }
    }
}
```

Esto devuelve el objeto:
```
{
  invitationId: string,
  oobContentData: string
}
```

`oobContentData`debe ser utilizado para renderizar el QR. 

`invititationId`debe guardarse para mapear la sesión que debe liberarse una vez resuelta la verificación.

## Escaneo de QR
El usuario debe escanear el QR con la wallet mobile. Luego de presentar la credencial, la API dispara la llamada al webhook configurado, enviando el tipo de evento y su payload.
Para la verificación, este es su payload:

```
{
    invitationId: string;
    verifierDID: string;
    holderDID: string;
    verifiableCredentials: VerifiableCredential[];
    verified: boolean;
    role: 'ISSUER' | 'VERIFIER';
}
```

Acá se envía el invitationId para que pueda mapearse con la sesión que inició el flujo originalmente.

Luego de esto, solo queda comprobar el resultado del campo "verified" y si es true, mapear el invitationId con la sesión y liberar el acceso.

## Como configurar el webhook al que la API debe enviar el evento usando la API SSI
Al crear un did desde la API SSI, se puede definir el webhook para ese DID que se está creando. Para eso, debe usarse el endpoint para crea el DID y pasar ese dato en el campo webhookUrl

```
PUT https://sandbox-ssi.extrimian.com/v1/dids/quarkid HTTP/1.1

{
    "websocket": "https://sandbox-ssi-ws.extrimian.com",
    "webhookUrl": "mi-websocket-url.com",
    "didMethod": "did:quarkid",
}
```