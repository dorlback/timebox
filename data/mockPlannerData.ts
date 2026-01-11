export const MOCK_DB_RESPONSE = {
  payload: {
    brainDump: [
      { id: 1716180000001, text: "DB 연동 로직 테스트하기", completed: false },
      { id: 1716180000002, text: "JSON 데이터 구조 확정", completed: true }
    ],
    todoList: [
      { id: 1716180000101, text: "UI 컴포넌트 데이터 바인딩", completed: false }
    ],
    timeBlocks: [
      {
        id: 2000000000001, // 블록 자체 ID
        todoId: 1716180000101, // Todo ID와 매칭
        text: "UI 컴포넌트 데이터 바인딩",
        startTime: 60,  // 새벽 1시 (테스트용으로 상단에 배치)
        endTime: 180,   // 새벽 3시
        colorIndex: 0,
        completed: false
      }
    ]
  }
};