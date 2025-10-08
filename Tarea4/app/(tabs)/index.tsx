import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, Modal, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { BACKEND_URL } from '../../config';

interface Producto {
  id: number;
  titulo: string;
  precio: string;
  descripcion: string;
  imageUri?: string;
  imageLocal?: any;
}

const Index = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [resizeMode, setResizeMode] = useState<'cover' | 'contain' | 'stretch'>('cover');
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Para agregar producto
  const [agregarModalVisible, setAgregarModalVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevaImageUri, setNuevaImageUri] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/products`);
      const dataFromApi = await response.json();

      const formattedData: Producto[] = dataFromApi.map((p: any) => ({
        id: p.id,
        titulo: p.title,
        precio: p.price.toString(),
        descripcion: p.description,
        imageUri: p.imageUrl,
      }));

      console.log('Productos formateados:', formattedData);
      setProductos(formattedData);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    (p.titulo ?? '').toLowerCase().includes(filtro.toLowerCase())
  );

  const toggleFavorito = (id: number) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const agregarProducto = async () => {
    if (!nuevoTitulo || !nuevoPrecio || !nuevaDescripcion) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nuevoTitulo,
          price: parseFloat(nuevoPrecio),
          description: nuevaDescripcion,
          imageUrl: nuevaImageUri || undefined,
        }),
      });

      if (!response.ok) throw new Error('Error al agregar producto');

      const nuevoProducto = await response.json();

      // Actualizamos la lista
      setProductos(prev => [
        ...prev,
        {
          id: nuevoProducto.id,
          titulo: nuevoProducto.title,
          precio: nuevoProducto.price.toString(),
          descripcion: nuevoProducto.description,
          imageUri: nuevoProducto.imageUrl,
        },
      ]);

      // Limpiar formulario y cerrar modal
      setNuevoTitulo('');
      setNuevoPrecio('');
      setNuevaDescripcion('');
      setNuevaImageUri('');
      setAgregarModalVisible(false);

      Alert.alert('Éxito', 'Producto agregado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo agregar el producto');
    }
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const esFavorito = favoritos.includes(item.id);

    const imageSource = item.imageLocal
      ? item.imageLocal
      : item.imageUri
        ? { uri: item.imageUri }
        : null;

    return (
      <Pressable
        onPress={() => { setProductoSeleccionado(item); setModalVisible(true); }}
        onLongPress={() => toggleFavorito(item.id)}
        style={[styles.itemContainer, esFavorito && styles.favorito]}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, { backgroundColor: '#ccc' }]} />
        )}
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitulo}>{item.titulo}</Text>
          <Text style={styles.itemPrecio}>{item.precio}</Text>
        </View>
        {esFavorito && <Text style={styles.iconoFavorito}>❤️</Text>}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar por título..."
        value={filtro}
        onChangeText={setFiltro}
        style={styles.input}
      />

      <Pressable style={styles.addButton} onPress={() => setAgregarModalVisible(true)}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>+ Agregar Producto</Text>
      </Pressable>

      <FlatList
        data={productosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
      />

      {/* Modal para ver producto */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {productoSeleccionado && (
              <>
                {productoSeleccionado.imageLocal || productoSeleccionado.imageUri ? (
                  <Image
                    source={
                      productoSeleccionado.imageLocal
                        ? productoSeleccionado.imageLocal
                        : { uri: productoSeleccionado.imageUri! }
                    }
                    style={[styles.modalImage, { resizeMode }]}
                  />
                ) : (
                  <View style={[styles.modalImage, { backgroundColor: '#ccc' }]} />
                )}
                <Text style={styles.modalTitulo}>{productoSeleccionado.titulo}</Text>
                <Text style={styles.modalDescripcion}>{productoSeleccionado.descripcion}</Text>

                <View style={styles.buttonsContainer}>
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('cover')}><Text>Cover</Text></Pressable>
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('contain')}><Text>Contain</Text></Pressable>
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('stretch')}><Text>Stretch</Text></Pressable>
                </View>

                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: 'white' }}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para agregar producto */}
      <Modal visible={agregarModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Agregar Producto</Text>

            <TextInput placeholder="Título" value={nuevoTitulo} onChangeText={setNuevoTitulo} style={styles.input} />
            <TextInput placeholder="Precio" value={nuevoPrecio} onChangeText={setNuevoPrecio} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Descripción" value={nuevaDescripcion} onChangeText={setNuevaDescripcion} style={styles.input} />
            <TextInput placeholder="URL Imagen (opcional)" value={nuevaImageUri} onChangeText={setNuevaImageUri} style={styles.input} />

            <Pressable style={styles.addButton} onPress={agregarProducto}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Guardar</Text>
            </Pressable>

            <Pressable style={[styles.closeButton, { marginTop: 10 }]} onPress={() => setAgregarModalVisible(false)}>
              <Text style={{ color: 'white' }}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  input: { margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 5 },
  lista: { paddingHorizontal: 10 },
  itemContainer: { flexDirection: 'row', backgroundColor: '#eef', marginVertical: 5, padding: 10, borderRadius: 5, alignItems: 'center' },
  itemTextContainer: { flex: 1, marginLeft: 10 },
  itemTitulo: { fontSize: 16, fontWeight: 'bold' },
  itemPrecio: { fontSize: 14, color: '#666' },
  itemImage: { width: 60, height: 60, borderRadius: 5 },
  iconoFavorito: { fontSize: 20, marginLeft: 5 },
  favorito: { borderColor: 'red', borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalImage: { width: 200, height: 200, marginBottom: 10 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold' },
  modalDescripcion: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  buttonsContainer: { flexDirection: 'row', marginVertical: 10 },
  resizeButton: { marginHorizontal: 5, padding: 10, backgroundColor: '#eee', borderRadius: 5 },
  closeButton: { backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5, alignItems: 'center', marginHorizontal: 10 },
});
