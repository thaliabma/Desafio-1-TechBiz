import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import ia from "../assets/image/ia.svg";
import EntitySearch from "./EntitySearch"
import { createNode} from '../../store/Slices/newNodeSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { toggleButton } from '../../store/Slices/menuSlice.js';

// Dados fictícios
const entities = [
  { id: 1, name: "Pessoa", value: "Maria Clara" },
  { id: 4, name: "Empresa", value: "TechCorp" },
  { id: 2, name: "E-mail", value: "@" },
  { id: 3, name: "Telefone", value: "(99)9999-9999" },
  // { id: 5, name: "Pessoa Epsilon", value: "56789012" },
];



const Container = styled("div")(({ theme }) => ({
  width: "400px",
  minHeight: "300px",
  margin: "20px auto",
  position: "relative",
  backgroundColor: "#6765A6",
  borderRadius: "15px",
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledInput = styled("input")(({ theme }) => ({
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  fontSize: "16px",
  boxSizing: "border-box",
  outline: "none",
  "&:focus": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}50`,
  },
}));

const StyledList = styled("ul")(({ theme, show }) => ({
  listStyleType: "none",
  padding: "0",
  // margin: "2px 0 0 0",
  // position: 'absolute',
  width: "100%",
  backgroundColor: "transparent",
  // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  overflow: "hidden",
  maxHeight: "200px",
  overflowY: "auto",
  opacity: show ? 1 : 0,
  transform: show ? "scaleY(1)" : "scaleY(0)",
  transformOrigin: "top",
  transition: "opacity 0.3s ease, transform 0.3s ease",
  zIndex: 10,
}));

const StyledListItem = styled("li")(({ theme }) => ({
  padding: "10px",
  cursor: "pointer",
  marginBottom: "4px",
  display: "flex",
  // height: '15px',
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "white",
  borderRadius: "10px",
}));


const SelectionBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [chooseEntitie, setChooseEntitie] = useState(false);
  const [selectedObject, setSelectedObject] = useState({
    id: '',
    type: '',
    name: '',
    role: '', // Defina valores padrão ou deixe vazio se não for usado
    img_path: '', // Defina valores padrão ou deixe vazio se não for usado
  });
  
  const dispatch = useDispatch();


  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      // Filtra entidades baseadas no valor de pesquisa
      const filtered = entities.filter((entity) =>
        entity.value.toLowerCase().includes(value)
      );
      setFilteredEntities(filtered);
      setIsListVisible(true);
    } else {
      setFilteredEntities([]);
      setIsListVisible(false);
    }
  };

  const handleSelect = (entity) => {
    // const node = {
    //   id: entity.id,
    //   type: entity.name,
    //   name: searchTerm,
    //   role: '', // Defina o valor adequado se for usado
    //   img_path: '', // Defina o valor adequado se for usado
    // }
    dispatch(toggleButton('createNode'));

    // dispatch(createNode(node));
    setSearchTerm('');
    setFilteredEntities([]);
    setIsListVisible(false);
  };
  return (
    <Container>
      {!chooseEntitie? 
      <>
      <h2
        style={{
          fontFamily: "Montserrat",
          fontWeight: "inherit",
          color: "white",
        }}
      >
        Criação de entidade
      </h2>
      <div style={{ width: "100%" }}>
        <h4
          style={{
            fontFamily: "Montserrat",
            fontWeight: "normal",
            color: "white",
            fontSize: "15px",
            margin: 0,
          }}
        >
          Inserir dado
        </h4>
        <StyledInput
          type="text"
          placeholder="Insira cnpj, cpf, e-mail..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <h4
        style={{
          fontFamily: "Montserrat",
          fontWeight: "normal",
          color: "white",
          fontSize: "15px",
          marginTop: "8px",
          display: isListVisible ? "block" : "none",
        }}
      >
        O dado que você está cadastrando é um(a)...
      </h4>
      <StyledList show={isListVisible}>
        {filteredEntities.map((entity) => (
          <StyledListItem key={entity.id} onClick={() => handleSelect(entity)}>
            <img
              src={ia}
              alt="ia"
              style={{ marginRight: "5px", width: "20px" }}
            />
            {entity.name}
          </StyledListItem>
        ))}
      </StyledList>
      <h4
        style={{
          fontFamily: "Montserrat",
          fontWeight: "normal",
          color: "white",
          fontSize: "15px",
          marginTop: "8px",
          display: isListVisible ? "block" : "none",
          cursor: "pointer",
          textDecoration: "underline",
          transition: "color 0.3s ease, transform 0.3s ease",
        }}
        onClick={() => {setChooseEntitie(true)}}
        onMouseEnter={(e) => {
          e.target.style.fontWeight = "bold";
          e.target.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "white";
          e.target.style.transform = "scale(1)";
        }}
      >
        Prefiro escolher a entidade
      </h4>
      </>: <EntitySearch/> }
    </Container>
  );
};

export default SelectionBox;
