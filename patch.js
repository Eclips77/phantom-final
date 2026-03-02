const fs = require('fs');
const filepath = 'libs/rabbit-mq/src/publisher/rabbit-mq.publisher.spec.ts';
let code = fs.readFileSync(filepath, 'utf8');

code = code.replace(/let mockClientProxy: any;/, `let mockClientProxy: { emit: jest.Mock; send: jest.Mock };`);
code = code.replace(/expect\(ClientProxyFactory\.create\)/g, `expect(jest.spyOn(ClientProxyFactory, 'create'))`);

fs.writeFileSync(filepath, code);
