// 간단한 FoodItem 엔터티 클래스 (실제로는 백엔드 API와 연동)
export class FoodItem {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.expiry_date = data.expiry_date;
    this.quantity = data.quantity;
    this.unit = data.unit;
    this.status = data.status || 'active';
  }

  static async filter(filters = {}, orderBy = null) {
    // 실제로는 API 호출, 여기서는 모의 데이터
    const mockData = [
      new FoodItem({
        id: 1,
        name: '우유',
        category: '유제품',
        expiry_date: '2025-08-30',
        quantity: 1,
        unit: '개',
        status: 'active'
      }),
      new FoodItem({
        id: 2,
        name: '계란',
        category: '축산품',
        expiry_date: '2025-08-29',
        quantity: 10,
        unit: '개',
        status: 'active'
      }),
      new FoodItem({
        id: 3,
        name: '당근',
        category: '채소',
        expiry_date: '2025-09-05',
        quantity: 3,
        unit: '개',
        status: 'active'
      })
    ];

    return mockData.filter(item => {
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }

  static async update(id, updateData) {
    console.log(`FoodItem ${id} 업데이트:`, updateData);
    return Promise.resolve();
  }

  static async delete(id) {
    console.log(`FoodItem ${id} 삭제`);
    return Promise.resolve();
  }

  static async create(data) {
    console.log('FoodItem 생성:', data);
    return Promise.resolve(new FoodItem({
      ...data,
      id: Date.now() // 임시 ID
    }));
  }
}