import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, Modal, FlatList, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
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

  // 🧩 Estado para nuevo producto
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');

  // 🔹 Obtener productos
  const fetchProductos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/products`);
      const data = await response.json();
      const productosMapeados: Producto[] = data.map((p: any) => ({
        id: p.id,
        titulo: p.title ?? '',
        precio: `$${p.price}`,
        descripcion: p.description ?? '',
        imageUri: p.imageUrl ?? ''
      }));
      setProductos(productosMapeados);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 🧩 Función para agregar producto (POST)
  const agregarProducto = async () => {
    if (!nuevoTitulo || !nuevoPrecio) {
      Alert.alert('Error', 'Título y precio son obligatorios');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nuevoTitulo,
          description: nuevaDescripcion,
          price: parseFloat(nuevoPrecio),
          imageUrl: nuevaImagen,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Producto agregado correctamente');
        setNuevoTitulo('');
        setNuevoPrecio('');
        setNuevaDescripcion('');
        setNuevaImagen('');
        fetchProductos(); // refresca lista
      } else {
        const errorText = await response.text();
        Alert.alert('Error', `No se pudo agregar el producto: ${errorText}`);
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
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

  const renderItem = ({ item }: { item: Producto }) => {
    const esFavorito = favoritos.includes(item.id);
    return (
      <Pressable
        onPress={() => { setProductoSeleccionado(item); setModalVisible(true); }}
        onLongPress={() => toggleFavorito(item.id)}
        style={[styles.itemContainer, esFavorito && styles.favorito]}
      >
        <Image
          source={item.imageLocal ? item.imageLocal : { uri: item.imageUri! }}
          style={styles.itemImage}
        />
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
    <ScrollView style={styles.container}>
      <Text style={styles.tituloApp}>📦 Galería de Productos</Text>

      {/* 🔍 Filtro */}
      <TextInput
        placeholder="Buscar por título..."
        value={filtro}
        onChangeText={setFiltro}
        style={styles.input}
      />

      {/* 🆕 Formulario para agregar productos */}
      <View style={styles.formContainer}>
        <Text style={styles.subtitulo}>Agregar producto nuevo</Text>

        <TextInput
          placeholder="Título"
          value={nuevoTitulo}
          onChangeText={setNuevoTitulo}
          style={styles.input}
        />
        <TextInput
          placeholder="Precio"
          value={nuevoPrecio}
          onChangeText={setNuevoPrecio}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Descripción"
          value={nuevaDescripcion}
          onChangeText={setNuevaDescripcion}
          style={styles.input}
        />
        <TextInput
          placeholder="URL de imagen"
          value={nuevaImagen}
          onChangeText={setNuevaImagen}
          style={styles.input}
        />

        <Pressable style={styles.addButton} onPress={agregarProducto}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </Pressable>
      </View>

      {/* 🧾 Lista de productos */}
      <FlatList
        data={productosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
      />

      {/* 🔍 Modal de detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {productoSeleccionado && (
              <>
                <Image
                  source={
                    productoSeleccionado.imageLocal
                      ? productoSeleccionado.imageLocal
                      : { uri: productoSeleccionado.imageUri! }
                  }
                  style={[styles.modalImage, { resizeMode }]}
                />
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
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  tituloApp: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  input: { margin: 8, padding: 10, backgroundColor: 'white', borderRadius: 5 },
  lista: { paddingHorizontal: 10 },
  itemContainer: { flexDirection: 'row', backgroundColor: 'white', marginVertical: 5, padding: 10, borderRadius: 5, alignItems: 'center' },
  itemTextContainer: { flex: 1, marginLeft: 10 },
  itemTitulo: { fontSize: 16, fontWeight: 'bold' },
  itemPrecio: { fontSize: 14, color: '#666' },
  itemImage: { width: 60, height: 60, borderRadius: 5 },
  iconoFavorito: { fontSize: 20, marginLeft: 5 },
  favorito: { borderColor: 'red', borderWidth: 1 },
  formContainer: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  addButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalImage: { width: 200, height: 200, marginBottom: 10 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold' },
  modalDescripcion: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  buttonsContainer: { flexDirection: 'row', marginVertical: 10 },
  resizeButton: { marginHorizontal: 5, padding: 10, backgroundColor: '#eee', borderRadius: 5 },
  closeButton: { backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
});
