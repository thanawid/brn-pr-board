window.BRN_AUTH_CONFIG = {
  appName: 'BRN PR Board',
  internalEmailDomain: 'brn.local',
  adminEmails: ['thanawid@gmail.com'],
  staffAccounts: [
    { username: 'pr01', displayName: 'เจ้าหน้าที่ PR 01' },
    { username: 'pr02', displayName: 'เจ้าหน้าที่ PR 02' },
    { username: 'pr03', displayName: 'เจ้าหน้าที่ PR 03' },
    { username: 'pr04', displayName: 'เจ้าหน้าที่ PR 04' },
    { username: 'pr05', displayName: 'เจ้าหน้าที่ PR 05' }
  ],
  lineReminder: {
    mode: 'firestoreOutbox',
    outboxCollection: 'lineOutbox',
    defaultTarget: 'กลุ่ม PR',
    webhookUrl: ''
  },
  firebaseConfig: {
    apiKey: 'AIzaSyByR15Ptjs6Q-DMzVWPQmTOihqMMhW_868',
    authDomain: 'brn-pr-board.firebaseapp.com',
    projectId: 'brn-pr-board',
    storageBucket: 'brn-pr-board.firebasestorage.app',
    messagingSenderId: '53207804495',
    appId: '1:53207804495:web:0c1f4d232eb3893accd83a',
    measurementId: 'G-2CLDLX6RLD'
  }
};
