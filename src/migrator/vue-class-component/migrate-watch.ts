import {
  ObjectLiteralExpression, MethodDeclaration, PropertyAssignment, SyntaxKind,
} from 'ts-morph';

export default (mainObject: ObjectLiteralExpression) => {
  const REMOVE_THIS = 'this';
  const watchMainObject = mainObject
    .getProperty('watch')
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  const watchProperties = watchMainObject?.getProperties();

  watchProperties?.forEach((watchProperty) => {
    const watchHandler = watchProperty instanceof PropertyAssignment
      ? (watchProperty.getInitializer() as ObjectLiteralExpression)?.getProperty('handler')
      : watchProperty;
    const theThisParam = (watchHandler as MethodDeclaration)?.getParameter(REMOVE_THIS);

    if (theThisParam) {
      theThisParam.remove();
    }
  });
};
