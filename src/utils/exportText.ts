import { Node, Edge } from "reactflow";
import { saveAs } from "file-saver";

export function exportWorkflowAsText(nodes: Node[], edges: Edge[]) {
  const connections: { [key: string]: string[] } = {};
  const nodeMap: { [key: string]: Node } = {};

  for (const node of nodes) {
    nodeMap[node.id] = node;
    connections[node.id] = [];
  }

  for (const edge of edges) {
    if (edge.source && edge.target) {
      connections[edge.source].push(edge.target);
    }
  }

  const lines: string[] = [];

  for (const node of nodes) {
    const label = node.data?.label || "Bez nazwy";
    const desc = node.data?.description || "";
    const conns = connections[node.id].map((id) => {
      const targetLabel = nodeMap[id]?.data?.label || id;
      return `→ ${targetLabel}`;
    });

    lines.push(`== ${label} ==`);
    if (desc) lines.push(desc);
    if (conns.length) {
      lines.push("Połączenia:");
      lines.push(...conns);
    }
    lines.push(""); // pusty wiersz między sekcjami
  }

  const finalText = lines.join("\n");
  const blob = new Blob([finalText], { type: "text/plain" });
  saveAs(blob, "workflow_gpt.txt");
}
