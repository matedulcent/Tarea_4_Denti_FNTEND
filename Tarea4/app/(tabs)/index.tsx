// app/index.tsx
import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, Modal, FlatList, StyleSheet } from 'react-native';

interface Producto {
  id: number;
  titulo: string;
  precio: string;
  descripcion: string;
  imageUri?: string;
  imageLocal?: any;
}

const productosData: Producto[] = [

  {
    id: 2,
    titulo: 'Lapiz',
    precio: '$200',
    descripcion: 'HB Mina.',
    imageUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMaFT1Ih8BPMEiEU0tvRjzMLPgxAzEbNxHRA&s',
  },
  {
    id: 3,
    titulo: 'Goma Borrar',
    precio: '$150',
    descripcion: 'Dos puntas',
    imageUri: 'https://acdn-us.mitiendanube.com/stores/001/132/430/products/goma-de-borrar-dos-banderas-214-lapiz-tinta-unidad-e88b462598cd2ab1bb17349533816599-480-0.jpg',
  },
];

const Index = () => {
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [resizeMode, setResizeMode] = useState<'cover' | 'contain' | 'stretch'>('cover');
  const [favoritos, setFavoritos] = useState<number[]>([]);

  const productosFiltrados = productosData.filter((p) =>
    p.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  const toggleFavorito = (id: number) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const esFavorito = favoritos.includes(item.id);
    return (
      <Pressable
        onPress={() => {
          setProductoSeleccionado(item);
          setModalVisible(true);
        }}
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
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('cover')}>
                    <Text>Cover</Text>
                  </Pressable>
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('contain')}>
                    <Text>Contain</Text>
                  </Pressable>
                  <Pressable style={styles.resizeButton} onPress={() => setResizeMode('stretch')}>
                    <Text>Stretch</Text>
                  </Pressable>
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
