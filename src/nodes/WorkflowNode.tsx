import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type WorkflowNodeData = {
  label: string;
  description: string;
  color: string;
  onDelete: (id: string) => void;
};

export default function WorkflowNode({ id, data }: NodeProps<WorkflowNodeData>) {
  return (
    <div
      style={{
        backgroundColor: data.color,
        borderRadius: 12,
        padding: "8px 12px",
        color: "#fff",
        border: "2px solid black",
        minWidth: 120,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", flexGrow: 1, pointerEvents: "none" }}>{data.label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(id);
          }}
          style={{
            fontSize: 10,
            lineHeight: "12px",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginLeft: 4,
          }}
          title="Usuń chmurkę"
        >
          ×
        </button>
      </div>
      {/* Handles */}
      <Handle type="target" position={Position.Top} style={{ background: "#fff" }} />
      <Handle type="target" position={Position.Left} style={{ background: "#fff" }} />
      <Handle type="target" position={Position.Right} style={{ background: "#fff" }} />
      <Handle type="target" position={Position.Bottom} style={{ background: "#fff" }} />

      <Handle type="source" position={Position.Top} style={{ background: data.color }} />
      <Handle type="source" position={Position.Left} style={{ background: data.color }} />
      <Handle type="source" position={Position.Right} style={{ background: data.color }} />
      <Handle type="source" position={Position.Bottom} style={{ background: data.color }} />
    </div>
  );
}
