/** Default starter diagram for the admin PlantUML editor. */
export const PLANTUML_STARTER = `@startuml
title Your diagram title

participant Client
participant Server

Client -> Server : Request
Server --> Client : Response
@enduml`;

/** Wrap raw PlantUML source in a markdown fenced block for lesson content. */
export function toPlantUmlMarkdownBlock(code) {
  const trimmed = (code || '').trim();
  if (!trimmed) return '';
  return `\n\n\`\`\`plantuml\n${trimmed}\n\`\`\`\n\n`;
}
