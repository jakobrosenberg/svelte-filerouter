export function metaFromFile({ instance }: {
    instance: any;
}): Promise<void>;
export function parseComment(body: string): {
    [x: string]: any;
};
export function htmlComments(filepath: string): Promise<{}>;
export function getExternalMeta(filepath: string, context: any): Promise<any>;