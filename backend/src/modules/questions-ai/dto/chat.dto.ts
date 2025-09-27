export class StartChatDto {
    // opcional: se quiser criar já nome/dob via UI, pode mandar aqui,
    // mas por padrão começamos sem (o bot pedirá)
    name?: string;
    dob?: string; // 'DD/MM/AAAA'
  }
  
  export class SendMessageDto {
    sessionId: string;
    message: string;
  }
  