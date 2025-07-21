import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { getRandomColor } from "./utils/colors";
import WorkflowNode, { WorkflowNodeData } from "./nodes/WorkflowNode";
import DeletableEdge, { DeletableEdgeData } from "./edges/DeletableEdge";
import { saveAs } from "file-saver";
import { exportWorkflowAsText } from "./utils/exportText";

type WFNode = Node<WorkflowNodeData>;
type WFEdge = Edge<DeletableEdgeData>;

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<WFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WFEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id != id));
    setEdges((eds) => eds.filter((e) => e.source != id && e.target != id));
    setSelectedNodeId((cur) => (cur === id ? null : cur));
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id != id));
  }, []);

  const addNode = useCallback(() => {
    const id = uuidv4();
    const color = getRandomColor(nodes.map((n) => n.data.color));
    const newNode: WFNode = {
      id,
      type: "workflowNode",
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        label: "Nowa chmurka",
        description: "",
        color,
        onDelete: deleteNode,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, deleteNode]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const sourceColor = nodes.find((n) => n.id === params.source)?.data.color || "#000";
      const id = uuidv4();
      const newEdge: WFEdge = {
        ...(params as Connection),
        id,
        type: "deletable",
        data: { color: sourceColor, onDelete: deleteEdge },
        style: { stroke: sourceColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: sourceColor },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, deleteEdge]
  );

  const onNodeClick = useCallback((_e: any, node: WFNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const updateNodeData = useCallback(
    (key: "label" | "description", value: string) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId
            ? {
                ...n,
                data: { ...n.data, [key]: value },
              }
            : n
        )
      );
    },
    [selectedNodeId]
  );

  const saveToFile = useCallback(() => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "workflow.json");
  }, [nodes, edges]);

  const loadFromFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(text);

          // reattach callbacks
          const nodesWithCb: WFNode[] = loadedNodes.map((n: any) => ({
            ...n,
            type: "workflowNode",
            data: { ...n.data, onDelete: deleteNode },
          }));
          const edgesWithCb: WFEdge[] = loadedEdges.map((e: any) => ({
            ...e,
            type: "deletable",
            data: { ...e.data, onDelete: deleteEdge },
          }));

          setNodes(nodesWithCb);
          setEdges(edgesWithCb);
        } catch (err) {
          console.error("Błąd podczas wczytywania workflow:", err);
        }
      };
      reader.readAsText(file);
    },
    [deleteNode, deleteEdge]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [selectedNodeId, nodes]
  );

  const nodeTypes = useMemo(
    () => ({ workflowNode: WorkflowNode }),
    []
  );
  const edgeTypes = useMemo(
    () => ({ deletable: DeletableEdge }),
    []
  );

  return (
    <div className="w-screen h-screen">
      {/* Top controls */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex gap-4">
        <button
          onClick={addNode}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl"
        >
          Dodaj chmurkę
        </button>
        <button
          onClick={() => exportWorkflowAsText(nodes, edges)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl"
        >
          Zapisz TXT (dla GPT)
        </button>

        <button
          onClick={saveToFile}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl"
        >
          Zapisz workflow
        </button>
        <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer">
          Wczytaj workflow
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={loadFromFile}
          />
        </label>
      </div>

      <ReactFlow
        onEdgeClick={(_, edge) => deleteEdge(edge.id)}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute right-4 top-4 w-80 bg-white shadow-2xl rounded-2xl p-4 z-50">
          <h2 className="font-bold text-lg mb-2">Szczegóły chmurki</h2>
          <label className="text-sm text-gray-700">Tytuł:</label>
          <input
            value={selectedNode.data.label}
            onChange={(e) => updateNodeData("label", e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <label className="text-sm text-gray-700">Opis:</label>
          <textarea
            value={selectedNode.data.description}
            onChange={(e) => updateNodeData("description", e.target.value)}
            className="w-full border p-2 rounded h-24"
          />
        </div>
      )}
    </div>
  );
};

export default App;
