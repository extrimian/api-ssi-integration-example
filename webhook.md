# API Webhooks

La API envía eventos a través de webhook con el objetivo de notificar diferentes eventos que transcurren en la aplicación. Estos eventos están preparados para los diferentes roles que pueden cohexistir en la wallet. Para cada rol, existen los siguientes eventos que notifican lo sigueinte:

## Issuer
- Notifica cuando se emite una nueva credencial y se envía a un holder (Falta terminar)

## Verifier
- Notifica cuando finaliza un flujo de verificación

## Holder
- Notifica cuando se recibe una nueva credencial verificable
- Notifica cuando se solicita la presentación de credenciales verificables
- Notifica cuando finaliza el flujo de presentación de credenciales

## Configuración del Webhook

## Variable de Entorno
El endpoint del webhook se define desde la variable de entorno `WEBHOOK_URL`. Ahí se debe colocar el endpoint, al cual la API debe tener acceso, en el que se notificarán estos eventos.
Sólo debe configurarse un endpoint, ya que el propio body request consumido por el webhook describe el tipo de evento que lo disparó. El payload enviado por la API tiene esta estructura:

```
export class Payload<T> {
    eventType: EventType;
    eventData: T;

    constructor(p: { eventType: EventType, eventData: T}) {
        this.eventType = p.eventType;
        this.eventData = p.eventData;
    }
}
```

## Event Types
Los posibles Event Types disparados por el webhook son los siguientes:

```
export enum EventType {
    NewCredentialArrived = "credential-arrived",
    PresentationRequest = "presentation-request",
    VerifiablePresentationFinished = "verifiable-presentation-finished",
    HolderPresentationFinished = "holder-presentation-finished",
}
```


### credential-arrived
Se dispara cuando el holder recibe una nueva credencial. En event data viene la información sobre la vc recibida y el DID del holder que la recibió:

```
export class NewCredentialArrivedEventData {
    vc: VerifiableCredential;
    holderDID: string;

    constructor(init: Partial<NewCredentialArrivedEventData>) {
        this.vc = init.vc;
        this.holderDID = init.holderDID;
    }
}
```

### presentation-request
Se dispara cuando el verifier le solicita al holder que debe presentar una nueva credencial. Por ejemplo, luego de que el holder lee el código QR, se dispara un proceso asincrónico. En un determinado momento, el holder debe presentar una credencial. Este evento se dispara para indicarle al holder la necesidad de presentación de una credencial. En el evento viene información sobre que credenciales pueden presentarse (de las que tenga el holder en su poder), cual es el DID del verifier y que credenciales va a recibir (en caso de que luego de la presentación se generen credenciales para el holder).

```
export class PresentationRequestEventData {
    invitationId: string;
    credentialsToPresent: VerifiableCredentialWithInfo[];
    holderDID: string;
    verifierDID: string;
    credentialsToRecive?: VerifiableCredentialWithInfo[];

    constructor(init: Partial<PresentationRequestEventData>) {
        Object.assign(this, init);
    }
}
```

```
export type VerifiableCredentialWithInfo = {
    data: VerifiableCredential;
    styles?: CredentialManifestStyles;
    display?: CredentialDisplay;
};
```

```
export type CredentialManifestStyles = {
    thumbnail?: ThumbnailImage;
    hero?: ThumbnailImage;
    background?: ColorDefinition;
    text?: ColorDefinition;
};
export type ColorDefinition = {
    color: string;
};
export type ThumbnailImage = {
    uri: string;
    alt: string;
};
```

```
export type CredentialDisplay = {
    title?: DisplayMappingObject;
    subtitle?: DisplayMappingObject;
    description?: DisplayMappingObject;
    properties?: (DisplayMappingObject & {
        label?: string;
    })[];
};

export type DisplayMappingObject = {
    path?: string[];
    schema?: {
        type?: string;
    };
    fallback?: string;
} | {
    text: string;
};
```
```
export declare class VerifiableCredential<TSubject = any> {
    "@context"?: string[];
    id: string;
    type: string[];
    issuer: Issuer;
    name?: string;
    description?: string;
    issuanceDate: Date;
    expirationDate?: Date;
    credentialStatus?: CredentialStatus;
    credentialSubject: TSubject;
    refreshService?: IdType;
    credentialSchema?: IdType;
    proof?: Proof;
    constructor(init: Partial<UnsignedCredential<TSubject>>);
}
```

### verifiable-presentation-finished
Se dispara para notificarle al verificador que el proceso de verificación de SSI ha finalizado. En eventData ofrece datos del resultado de la verificación (campo verified) y en que rol se hizo la verificación (como issuer o como verifier). Informa además el DID del holder y el DID del verifier, junto con las credenciales presentadas por el holder.

```
export class VerifiablePresentationFinishedEventData {
    invitationId: string;
    verifierDID: string;
    holderDID: string;
    verifiableCredentials: VerifiableCredential[];
    verified: boolean;
    role: 'ISSUER' | 'VERIFIER';

    constructor(init: Partial<VerifiablePresentationFinishedEventData>) {
        Object.assign(this, init);
    }
}
```

### holder-presentation-finished
Se dispara para notificarle al holder que el proceso de verificación en el que participó ha finalizado. En eventData se envía información sobre el resultado de la verificación desde una perspectiva de SSI y el DID del holder que participó en el proceso de verificación.

```
export class HolderPresentationFinishedEventData {
    invitationId: string;
    holderDID: string;
    verified: boolean;

    constructor(init: Partial<HolderPresentationFinishedEventData>) {
        Object.assign(this, init);
    }
}
```