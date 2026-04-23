declare interface IHelloWorldWebPartStrings {
  PropertyPaneDescription:       string;
  BasicGroupName:                string;
  TitleFieldLabel:               string;
  EmbedModeFieldLabel:           string;
  AzureFunctionUrlFieldLabel:    string;
  EmbedModeUser:                 string;
  EmbedModeApp:                  string;
}

declare module 'HelloWorldWebPartStrings' {
  const strings: IHelloWorldWebPartStrings;
  export = strings;
}
