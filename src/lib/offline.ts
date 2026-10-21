import type { Suggestion } from "@/lib/catalog";

export type OfflineOpener = {
  reply: string;
  gloss: string;
  suggestions: Suggestion[];
};

export const offlineOpeners: Record<string, OfflineOpener> = {
  cafe: {
    reply: "¡Hola! ¿Qué te apetece tomar?",
    gloss: "Hi! What would you like to drink?",
    suggestions: [
      { es: "Un café con leche, por favor.", en: "A coffee with milk, please." },
      { es: "¿Tienes té?", en: "Do you have tea?" },
    ],
  },
  directions: {
    reply: "Dime, ¿a dónde vas?",
    gloss: "Tell me, where are you going?",
    suggestions: [
      { es: "¿Dónde está el metro?", en: "Where is the metro?" },
      { es: "Voy a la estación.", en: "I'm going to the station." },
    ],
  },
  market: {
    reply: "Pase. ¿Qué le pongo?",
    gloss: "Come closer. What can I get you?",
    suggestions: [
      { es: "¿Cuánto cuesta el mango?", en: "How much is the mango?" },
      { es: "Medio kilo, por favor.", en: "Half a kilo, please." },
    ],
  },
  tapas: {
    reply: "Buenas tardes. ¿Les traigo algo de beber?",
    gloss: "Good afternoon. Shall I bring you something to drink?",
    suggestions: [
      { es: "Dos cañas, por favor.", en: "Two small beers, please." },
      { es: "¿Qué tapas recomienda?", en: "Which tapas do you recommend?" },
    ],
  },
  hotel: {
    reply: "Buenas noches. ¿Tiene reserva?",
    gloss: "Good evening. Do you have a reservation?",
    suggestions: [
      { es: "Sí, a nombre de {name}.", en: "Yes, under the name {name}." },
      { es: "¿Hay una habitación más tranquila?", en: "Is there a quieter room?" },
    ],
  },
  station: {
    reply: "Hola. ¿A qué ciudad viaja?",
    gloss: "Hi. Which city are you traveling to?",
    suggestions: [
      { es: "Un billete a Madrid, por favor.", en: "A ticket to Madrid, please." },
      { es: "¿A qué hora sale el próximo tren?", en: "What time does the next train leave?" },
    ],
  },
  meet: {
    reply: "¡Hola! Pasa. ¿Cómo te llamas?",
    gloss: "Hi! Come in. What's your name?",
    suggestions: [
      { es: "Mucho gusto. Soy {name}.", en: "Nice to meet you. I'm {name}." },
      { es: "Gracias por la invitación.", en: "Thank you for the invitation." },
    ],
  },
  interview: {
    reply: "Gracias por venir. Cuénteme de usted.",
    gloss: "Thank you for coming. Tell me about yourself.",
    suggestions: [
      { es: "Trabajo en diseño.", en: "I work in design." },
      { es: "Me interesa este puesto.", en: "I'm interested in this role." },
    ],
  },
  doctor: {
    reply: "Buenos días. ¿Qué le pasa?",
    gloss: "Good morning. What's the matter?",
    suggestions: [
      { es: "Me duele la cabeza.", en: "My head hurts." },
      { es: "Desde hace tres días.", en: "For three days." },
    ],
  },
  party: {
    reply: "Hola, creo que no nos conocemos. ¿Cómo te llamas?",
    gloss: "Hi, I don't think we've met. What's your name?",
    suggestions: [
      { es: "Soy {name}. ¿Cómo conoces al anfitrión?", en: "I'm {name}. How do you know the host?" },
      { es: "La comida está muy rica.", en: "The food is really good." },
    ],
  },
  libre: {
    reply: "¿Qué tal hoy? Cuéntame una cosa.",
    gloss: "How's today? Tell me one thing.",
    suggestions: [
      { es: "Hoy estoy un poco cansado.", en: "Today I'm a little tired." },
      { es: "Tuve un día largo.", en: "I had a long day." },
    ],
  },
};

export function fillName(text: string, name: string) {
  const safe = name.trim() || "amigo";
  return text.replaceAll("{name}", safe);
}
