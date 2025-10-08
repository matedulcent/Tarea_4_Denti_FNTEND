import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Pressable, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/products`);
        const data: Producto[] = await response.json();

        console.log('Productos obtenidos de la BD:', data);

        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      } finally {
        setLoading(false);
        console.log('Carga finalizada, loading:', false);
      }
    };

    fetchProductos();
  }, []);

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

    // Solo mostrar imageLocal o imageUri si existen
    const imageSource = item.imageLocal ? item.imageLocal : item.imageUri ? { uri: item.imageUri } : undefined;

    return (
      <Pressable
        onPress={() => { setProductoSeleccionado(item); setModalVisible(true); }}
        onLongPress={() => toggleFavorito(item.id)}
        style={[styles.itemContainer, esFavorito && styles.favorito]}
      >
        {imageSource && <Image source={imageSource} style={styles.itemImage} />}
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

      <FlatList
        data={productosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
      />

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
                ) : null}
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
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  input: { margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 5 },
  lista: { paddingHorizontal: 10 },
  itemContainer: { flexDirection: 'row', backgroundColor: 'white', marginVertical: 5, padding: 10, borderRadius: 5, alignItems: 'center' },
  itemTextContainer: { flex: 1, marginLeft: 10 },
  itemTitulo: { fontSize: 16, fontWeight: 'bold' },
  itemPrecio: { fontSize: 14, color: '#666' },
  itemImage: { width: 60, height: 60, borderRadius: 5 },
  iconoFavorito: { fontSize: 20, marginLeft: 5 },
  favorito: { borderColor: 'red', borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalImage: { width: 200, height: 200, marginBottom: 10 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold' },
  modalDescripcion: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  buttonsContainer: { flexDirection: 'row', marginVertical: 10 },
  resizeButton: { marginHorizontal: 5, padding: 10, backgroundColor: '#eee', borderRadius: 5 },
  closeButton: { backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
});
