import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';

interface Universidad {
  _id: string;
  nombre: string;
  ciudad: string;
  contacto: string;
  email: string;
}

interface Documento {
  nombre_archivo: string;
  fecha_subida: string;
  estado_aprobacion: string;
}

function App() {
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedUniversidad, setSelectedUniversidad] = useState<string | null>(null);
  const [nuevoDocumento, setNuevoDocumento] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // formulario de universidad
  const [nuevoNombreUnivesidad, setNombreUnivesidad] = useState<string>('');
  const [nuevoCiudadUnivesidad, setCiudadUnivesidad] = useState<string>('');
  const [nuevoContactoUnivesidad, setContactoUnivesidad] = useState<string>('');
  const [nuevoEmailUnivesidad, setEmailUnivesidad] = useState<string>('');

  // Obtener todas las universidades
  useEffect(() => {
    axios.get('http://localhost:5050/api/universidades')
      .then(response => {
        setUniversidades(response.data.universidades);
      })
      .catch(error => console.error("Hubo un error al obtener las universidades", error));
  }, []);

  // Manejar el evento para agregar una nueva universidad
  const agregarUniversidad = async () => {
    try {
      const bodyData = {
        "nombre": nuevoNombreUnivesidad,
        "ciudad": nuevoCiudadUnivesidad,
        "contacto": nuevoContactoUnivesidad,
        "email": nuevoEmailUnivesidad
      };
      await axios.post(`http://localhost:5050/api/universidades`, bodyData);
    } catch (error) {
      console.log(error);
    }
  };

  // Obtener documentos de la universidad seleccionada
  const getDocumentos = (id_universidad: string) => {
    axios.get(`http://localhost:5050/api/universidades/documento/${id_universidad}`)
      .then(response => {
        setDocumentos(response.data.documentos);
        setSelectedUniversidad(id_universidad);
      })
      .catch(error => console.error("Hubo un error al obtener los documentos", error));
  };

  // Manejar el evento para agregar un nuevo documento (subir archivo)
  const agregarDocumento = async (id_universidad: string) => {
    if (!file) {
      alert("Por favor, selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append('nombre_archivo', file);
    try {
      await axios.post(`http://localhost:5050/api/universidades/documento/${id_universidad}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Documento agregado exitosamente");
      setFile(null); // Limpiar el archivo seleccionado
    } catch (error) {
      console.log("Error al agregar documento:", error);
    }
  };

  return (
    <Container className="my-3">
      <h1 className="text-center my-2">Administrar Universidades</h1>

      {/* Formulario de universidad */}
      <Card className="mb-3">
        <Card.Body>
          <h4 className="mb-2">Agregar Nueva Universidad</h4>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="nombre" className="mb-2">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoNombreUnivesidad}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNombreUnivesidad(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="ciudad" className="mb-2">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoCiudadUnivesidad}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCiudadUnivesidad(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="contacto" className="mb-2">
                  <Form.Label>Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoContactoUnivesidad}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setContactoUnivesidad(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="email" className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={nuevoEmailUnivesidad}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmailUnivesidad(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="success"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                agregarUniversidad();
              }}
            >
              Agregar Universidad
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla de Universidades */}
      <Row>
        <Col>
          <h3>Lista de Universidades</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {universidades.map((universidad) => (
                <tr key={universidad._id}>
                  <td>{universidad.nombre}</td>
                  <td>{universidad.ciudad}</td>
                  <td>
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={() => getDocumentos(universidad._id)}
                    >
                      Ver Documentos
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        {/* Tabla de Documentos */}
        <Col>
          {selectedUniversidad && (
            <Card>
              <Card.Body>
                <h4>Agregar Documento</h4>
                <Form>
                  <Form.Group controlId="documento" className="mb-3">
                    <Form.Label>Subir Documento</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={() => agregarDocumento(selectedUniversidad)}
                  >
                    Subir Documento
                  </Button>
                </Form>

                <h4 className="my-4">Documentos de la Universidad</h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Nombre del Archivo</th>
                      <th>Fecha Subida</th>
                      <th>Estado de Aprobación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.length > 0 ? (
                      documentos.map((documento, index) => (
                        <tr key={index}>
                          <td>{documento.nombre_archivo}</td>
                          <td>{documento.fecha_subida}</td>
                          <td>{documento.estado_aprobacion}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>No hay documentos disponibles.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;

