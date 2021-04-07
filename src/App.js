import './App.css';
import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';

const HOST_API = "http://localhost:3000/api"
const initialState = {
  list: [],
  item: {}
};
const Store = createContext(initialState)

const Form = () => {
  const formRef = useRef(null);
  const { dispatch, state: { item } } = useContext(Store);
  const { state, setState } = useState(item);

  const onAdd = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isComplete: false
    };

    fetch(HOST_API + "/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      });
  }

  const onEdit = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: item.id,
      isComplete: item.isCompleted
    };
    //el fetch es una forma de poder consultar algo por http o cualquier recurso que se encuentre en la web

    fetch(HOST_API + "/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      });
  }

  /*
  formulario con un campo que es el nombre. con el pamarametro onchange que lo que hace es agregar el nombre cuando tenga datos
  conserva los estados que tenga, y solo va a reemplazar el objeto que tenga (que es el nombre) mediante el evento
  */
  return <form ref={formRef}>
    <input type="text" name="name" defaultValue={item.name} onChange={(event) => {
      setState({ ...state, description: event.target.value })
    }}></input>
    {!item.id && <button onClick={onAdd}>Agregar</button>}
    {item.id && <button onClick={onEdit}>Actualizar</button>}
  </form>
}


const List = () => {
  // este es el contexto: el Store.// que lo que hace es ser un almacen para guardar los estados de la aplicacion
  const { dispatch, state } = useContext(Store); 

  //este use effect no permite que se bloquee el render. por ende permite trabajar el background
  useEffect(() => {
    //el fetch es una forma de poder consultar algo por http o cualquier recurso que se encuentre en la web
    fetch(HOST_API + "/todos")
      .then(Response => Response.json())
      .then((list) => {
        dispatch({ type: "update-list", list })
      })
  }, [state.list.length, dispatch]);

  const onDelete = (id) => {
    fetch(HOST_API + "/" + id + "/todo", {
      method: "DELETE"
    })
      .then((list) => {
        dispatch({ type: "delete-item", id })
      })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  }

  //retorna un listado (templated)
  return <div>
    <table>
      <thead>
        <tr>
          <td>ID</td>
          <td>Nombre</td>
          <td>¿Esta completado?</td>
        </tr>
      </thead>
      <tbody>
        {StaticRange.list.map((todo) => {
          return <tr key={todo.id}>
            <td>{todo.id}</td>
            <td>{todo.name}</td>
            <td>{todo.isCompleted === true ? "SI" : "NO"}</td>
            <td><butto onClick={() => onDelete(todo.id)}>Eliminar</butto></td>
            <td><butto onClick={() => onEdit(todo)}>Editar</butto></td>
          </tr>
        })}
      </tbody>
    </table>
  </div>
}
//esta es una funcion pura, porque dada una entrada siempre va a recibir una salida de esa entrada. en este caso el state
function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const listUpdateEdit = state.list.map((item) => {
        if (item.id === action.item.id) {
          return action.item;
        }
        return item;
      });
      return { ...state, list: listUpdateEdit, item: {} }
    case 'delete-item':
      const listUpdate = state.list.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, list: listUpdate }
    case 'update-list':
      return { ...state, list: action.list }
    case 'edit-item':
      return { ...state, item: action.item }
    case 'add-item':
      const newList = state.list;
      newList.push(action.item);
      return { ...state, list: newList }
    default:
      return state;
  }
}

//provaider: nos sirve para conectar entre si diferentes componentes por ejem. la lista y el item
const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <StoreProvider value={{ state, dispatch }}>
    {children}
  </StoreProvider>
}

function App() {
  return <StoreProvider>
    <Form />
    <List />
  </StoreProvider>

}

export default App;
