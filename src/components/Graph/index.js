import React, { useEffect, useRef, useState } from "react";
import ForceGraph3D from "3d-force-graph";
import "./Graph3D.css"; // Adicione aqui seu CSS personalizado para estilizar o modal

const Graph3D = () => {
  const graphRef = useRef();
  const [hoverNode, setHoverNode] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [clickNode, setClickNode] = useState(false);

  const handleMouseMove = (event) => {
    if (hoverNode) {
      setModalPosition({
        x: event.clientX + 10,
        y: event.clientY + 10,
      });
    }
  };

  useEffect(() => {
    const getData = async () => {
      const highlightNodes = new Set();
      const highlightLinks = new Set();

      const res = await fetch("miserables.json");

      const data = await res.json();
      const Graph = ForceGraph3D()(graphRef.current)
        .graphData(data)
        .onNodeClick((node) => {
          // Aim at node from outside it

          const distance = 40;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

          const newPos =
            node.x || node.y || node.z
              ? {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
                }
              : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

          Graph.cameraPosition(
            newPos, // new position
            node, // lookAt ({ x, y, z })
            3000 // ms transition duration
          );
          setTimeout(() => {
            setHoverNode(false);
            setClickNode(node);
          }, 2500);
        })
        .nodeColor((node) =>
          highlightNodes.has(node)
            ? node === hoverNode
              ? "rgb(255,0,0,1)"
              : "rgba(255,160,0,0.8)"
            : "rgba(0,255,255,0.6)"
        )
        .linkWidth((link) => (highlightLinks.has(link) ? 4 : 1))
        .linkDirectionalParticles((link) => (highlightLinks.has(link) ? 4 : 0))
        .linkDirectionalParticleWidth(4)
        .onNodeHover((node) => {
          // Update hover state

          if (node) {
            highlightNodes.clear();
            highlightLinks.clear();
            highlightNodes.add(node);
            node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
            node.links.forEach((link) => highlightLinks.add(link));

            // Update modal position
            //   setModalPosition({
            //     x: window.event.clientX + 10,
            //     y: window.event.clientY + 10,
            //   });
          }

          setHoverNode(node);

          updateHighlight();
        })
        .onLinkHover((link) => {
          highlightNodes.clear();
          highlightLinks.clear();

          if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
          }

          updateHighlight();
        });

      function updateHighlight() {
        Graph.nodeColor(Graph.nodeColor())
          .linkWidth(Graph.linkWidth())
          .linkDirectionalParticles(Graph.linkDirectionalParticles());
      }

      return () => {
        Graph._destructor();
      };
    };

    getData()
  }, []);

  return (
    <div onMouseMove={handleMouseMove}>
      <div ref={graphRef} style={{ height: "100vh", width: "100%", left: 0 }} />
      {hoverNode && (
        <div
          className="modal"
          style={{
            position: "absolute",
            left: modalPosition.x,
            top: modalPosition.y,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            pointerEvents: "none", // Permite que o mouse passe por cima do modal
          }}
        >
          <h4>Nó: {hoverNode.id}</h4>
          <p>Detalhes do nó...</p>
        </div>
      )}
      {clickNode && (
        <div
          className="modal"
          style={{
            position: "absolute",
            left: "75vw",
            top: "50vh",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            pointerEvents: "none", // Permite que o mouse passe por cima do modal
          }}
        >
          <h4>Transforms</h4>
        </div>
      )}
    </div>
  );
};

export default Graph3D;
