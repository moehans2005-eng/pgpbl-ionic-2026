import { Service } from '@angular/core';
import { ref, push, remove, get, update } from
'firebase/database';
import { database } from './firebase.service';

@Service()
export class DataService {

  deletePoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return remove(pointRef);
  }

  getPoint(key: string): Promise<{ name: string; coordinates: string; description?: string } | null> {
    const pointRef = ref(database, `points/${key}`);
    return get(pointRef).then((snapshot) => snapshot.val());
  }

  updatePoint(key: string, point: { name: string; coordinates: string; description: string }) {
    const pointRef = ref(database, `points/${key}`);
    return update(pointRef, point);
  }

  // Save a new point
  savePoint(point: { name: string, coordinates: string, description: string }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  getPoints() {
    const pointsRef = ref(database, 'points');
    return get(pointsRef).then((snapshot) => snapshot.val());
  }
}
