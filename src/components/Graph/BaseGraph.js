import ForceGraph3D from "3d-force-graph";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import fraudData from "../../data/fraud";
import valueColor from "../../utils/valueColor";
import "./Graph3D.css"; // Adicione aqui seu CSS personalizado para estilizar o modal
import { useSelector } from "react-redux";
import colors from "../../styles/variables";
import TransformBoard from "../TransformBoard";
import InfoBoard from "../InfoBoard";
import CreateEntitiesBoard from "../CreateEntitiesBoard";

const BaseGraph = ({ createNodeValue, nodeModeValue }) => {
  const graphRef = useRef();
  const [hoverNode, setHoverNode] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [clickNode, setClickNode] = useState(null);
  const [createNode, setCreateNode] = useState(false);
  const [links, setLinks] = useState([]);
  const newNode = useSelector((state) => state.node.node);
  const button = useSelector((state) => state.menu);

  const createTransform = button.createTransform;
  const createNewNode = button.createNode;
  const changeGraphMode = button.changeGraphMode;

  const staticNode = {
    id: 0,
    type: "empresa",
    name: "TechCorp",
    role: "Empresa Envolvida",
    img_path: "/imgs/techcorp.jpg",
    neighbors: [],
  };

  const staticTransfrom = {
    nodes: [
      {
        id: 0,
        type: "empresa",
        name: "TechCorp",
        role: "Empresa Envolvida",
        img_path: "/imgs/techcorp.jpg",
        neighbors: [],
      },
      {
        id: 1,
        type: "pessoa",
        name: "Alice Smith",
        role: "Suspeita",
        img_path: "/imgs/alice_smith.jpg",
        neighbors: [],
      },
      {
        id: 2,
        type: "pessoa",
        name: "Clara Adams",
        role: "Contadora",
        img_path: "/imgs/clara_adams.jpg",
        neighbors: [],
      },
      {
        id: 3,
        type: "pessoa",
        name: "Carlos Silva",
        role: "Gerente de Projetos",
        img_path: "/imgs/carlos_silva.jpg",
        neighbors: [],
      },
    ],
    links: [
      {
        source: 1,
        target: 0,
        relationship: "Associada a",
        value: 9,
      },
      {
        source: 0,
        target: 2,
        relationship: "Responsável pelas Finanças de",
        value: 7,
      },
      {
        source: 0,
        target: 3,
        relationship: "Gerencia Projetos em",
        value: 6,
      },
    ],
  };

  const handleMouseMove = (event) => {
    if (hoverNode && !clickNode) {
      setModalPosition({
        x: event.clientX + 10,
        y: event.clientY + 10,
      });
    }
  };

  const handleResetClickNode = () => {
    setClickNode(null);
  };

  useEffect(() => {
    const getData = async () => {
      const addNode = () => {
        const { nodes, links } = Graph.graphData();
        // Cria um novo nó com informações estáticas
        const newN = staticNode;

        // Atualiza o grafo com o novo nó
        Graph.graphData({
          nodes: [...nodes, newN],
          links: [...links],
        });
      };

      const addTransform = () => {
        const { nodes, links } = Graph.graphData();
        // Cria um novo nó com informações estáticas
        const newTransform = staticTransfrom;

        // Atualiza o grafo com o novo nó
        Graph.graphData(newTransform);
      };

      const addAllTransformsInvestigation = () => {
        Graph.graphData(fraudData);
      };

      const removeNode = (node) => {
        let { nodes, links } = Graph.graphData();
        links = links.filter((l) => l.source !== node && l.target !== node); // Remove links attached to node
        nodes.splice(node.id, 1); // Remove node
        nodes.forEach((n, idx) => {
          n.id = idx;
        }); // Reset node ids to array index
        Graph.graphData({ nodes, links });
      };

      const highlightNodes = new Set();
      const highlightLinks = new Set();
      const gData = fraudData;

      gData.links.forEach((link) => {
        const a = gData.nodes[link.source];
        const b = gData.nodes[link.target];
        if (a || b) {
          !a?.neighbors && (a.neighbors = []);
          !b?.neighbors && (b.neighbors = []);
          a.neighbors.push(b);
          b.neighbors.push(a);
          !a.links && (a.links = []);
          !b.links && (b.links = []);
          a.links.push(link);
          b.links.push(link);
        }
      });

      const Graph = ForceGraph3D({
        extraRenderers: [new CSS2DRenderer()],
      })(graphRef.current)
        // .graphData(gData)
        .backgroundColor("#282A36")
        .onNodeClick((node) => {
          if (clickNode && clickNode.id === node.id) {
            setClickNode(null);
          } else {
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

            setHoverNode(false);
            setTimeout(() => {
              setClickNode(node);
            }, 2500);
          }
        })
        .nodeColor((node) =>
          highlightNodes.has(node)
            ? node === hoverNode
              ? "rgb(255,0,0,1)"
              : "rgba(255,160,0,0.8)"
            : "rgba(0,255,255,0.6)"
        )
        .onBackgroundRightClick(() => addAllTransformsInvestigation())
        .linkColor(valueColor)
        .linkOpacity(0.6)
        .linkWidth((link) => (highlightLinks.has(link) ? 2 : 1))
        .linkDirectionalParticles((link) => (highlightLinks.has(link) ? 2 : 0))
        .linkDirectionalParticleWidth(2)
        .onNodeHover((node) => {
          // Update hover state
          if (!clickNode) {
            if (node) {
              highlightNodes.clear();
              highlightLinks.clear();
              highlightNodes.add(node);
              if (node.neighbors) {
                node.neighbors.forEach((neighbor) =>
                  highlightNodes.add(neighbor)
                );
                if (node.links) {
                  node.links.forEach((link) => highlightLinks.add(link));
                }
              }

              // Update modal position
              //   setModalPosition({
              //     x: window.event.clientX + 10,
              //     y: window.event.clientY + 10,
              //   });
            }

            setHoverNode(node);

            updateHighlight();
          }
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
        })
        .onBackgroundClick(() => {
          setCreateNode((prevState) => !prevState);
          setClickNode(false);
          // addNode()
        })
        .onNodeRightClick(removeNode)
        .linkThreeObjectExtend(true)
        .linkThreeObject((link) => {
          // extend link with text sprite
          const sprite = new SpriteText(link.relationship);
          sprite.color = "lightgrey";
          sprite.textHeight = 1.5;
          return sprite;
        })
        .linkPositionUpdate((sprite, { start, end }) => {
          const middlePos = Object.assign(
            ...["x", "y", "z"].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
            }))
          );

          // Position sprite
          Object.assign(sprite.position, middlePos);
        });

      if (button.changeGraphMode) {
        Graph.nodeThreeObject((node) => {
          const nodeEl = document.createElement("div");
          nodeEl.textContent = node.name;
          nodeEl.style.color = "black";
          nodeEl.className = "node-label";
          nodeEl.style.fontSize = "12px";
          nodeEl.style.padding = "1px 4px";
          nodeEl.style.borderRadius = "4px";
          nodeEl.style.userSelect = "none";
          nodeEl.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
          return new CSS2DObject(nodeEl);
        }).nodeThreeObjectExtend(true);
      } else {
        Graph.nodeThreeObject((node) => {
          const imgTexture = new THREE.TextureLoader().load(
            node.img_path ? node.img_path : "no_img.png"
          );
          imgTexture.colorSpace = THREE.SRGBColorSpace;
          const material = new THREE.SpriteMaterial({ map: imgTexture });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(12, 12);

          return sprite;
        });
      }

      function updateHighlight() {
        Graph.nodeColor(Graph.nodeColor())
          .linkWidth(Graph.linkWidth())
          .linkDirectionalParticles(Graph.linkDirectionalParticles());
      }
      if (createNewNode) {
        addNode();
        setCreateNode(false);
      }
      if (createTransform) {
        addTransform();
        setClickNode(false);
      }
      return () => {
        Graph._destructor();
      };
    };

    getData();
    // if(closeTransform){
    //   setClickNode(false)
    // }
  }, [newNode, createTransform, createNewNode, changeGraphMode]);

  return (
    <div onMouseMove={handleMouseMove}>
      <div
        ref={graphRef}
        style={{
          height: "100vh",
          width: "100%",
          left: 0,
          pointerEvents: clickNode ? "none" : "auto",
        }}
      />
      {hoverNode && !clickNode && (
        <div
          className="modal"
          style={{
            position: "absolute",
            left: "68vw",
            top: "20vh",
            zIndex: 1000,
            pointerEvents: "none", // Permite que o mouse passe por cima do modal
          }}
        >
          <InfoBoard />
        </div>
      )}
      {clickNode && (
        <div
          className="modal"
          style={{
            position: "absolute",
            left: "68vw",
            top: "30vh",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <TransformBoard resetClickNode={handleResetClickNode} />
        </div>
      )}
      {createNode && (
        <div
          className="modal"
          style={{
            position: "absolute",
            left: "68vw",
            top: "30vh",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <CreateEntitiesBoard />
        </div>
      )}
    </div>
  );
};

export default BaseGraph;
