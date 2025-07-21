import React, { CSSProperties } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "reactflow";

export type DeletableEdgeData = {
  color: string;
  onDelete: (id: string) => void;
};

export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<DeletableEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const finalStyle: CSSProperties = {
    stroke: data?.color || style?.stroke || "#000",
    strokeWidth: 2,
    ...style,
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={finalStyle} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              data?.onDelete?.(id);
            }}
            style={{
              fontSize: 10,
              lineHeight: "12px",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            title="Usuń połączenie"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
