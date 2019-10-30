import HashSet from 'dismantle/Common/HashSet';

class HashMap<K, V> {
  private map: Map<K, V> = new Map();
  get(key: K): V | undefined {
    return this.map.get(key);
  }
  put(key: K, value: V) {
    this.map.set(key, value);
  }
  clear() {
    this.map.clear();
  }
  clone() {
    return Object.assign({}, this);
  }
  containsKey(key: K) {
    return this.map.has(key);
  }
  keySet(): HashSet {
    return new HashSet(this.map.keys());
  }
}

export default HashMap;
