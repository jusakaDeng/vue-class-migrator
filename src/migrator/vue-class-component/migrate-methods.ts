import { ClassDeclaration, ObjectLiteralExpression } from 'ts-morph';
import { getObjectProperty } from '../utils';
import { vueSpecialMethods } from '../config';

export default (clazz: ClassDeclaration, mainObject: ObjectLiteralExpression) => {
  vueSpecialMethods
    .filter((m) => clazz.getMethod(m))
    .forEach((m) => {
      const method = clazz.getMethodOrThrow(m);
      const typeNode = method.getReturnTypeNode()?.getText();
      mainObject.addMethod({
        name: method.getName(),
        parameters: method.getParameters().map((p) => p.getStructure()),
        isAsync: method.isAsync(),
        returnType: typeNode,
        statements: method.getBodyText(),
      });
    });

  const methods = clazz
    .getMethods()
    .filter(
      (m) => !vueSpecialMethods.includes(m.getName())
        && !['data'].includes(m.getName())
        && !m.getDecorator('Watch'),
    );

  const reservedDecorators = ['prePermissionCheck'];

  if (methods.length) {
    const methodsObject = getObjectProperty(mainObject, 'methods');

    methods.forEach((method) => {
      const [firstDecorator] = method.getDecorators() || [];
      if (firstDecorator && !reservedDecorators.includes(firstDecorator.getName())) {
        throw new Error(`The method ${method.getName()} has non supported decorators.`);
      }

      const typeNode = method.getReturnTypeNode()?.getText();

      methodsObject.addMethod({
        name: method.getName(),
        parameters: method.getParameters().map((p) => p.getStructure()),
        isAsync: method.isAsync(),
        returnType: typeNode,
        statements: method.getBodyText(),
        leadingTrivia: firstDecorator ? `/* ${firstDecorator.getText()} */\n` : undefined,
      });
    });
  }
};
