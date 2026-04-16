export default function getStringQueryParams(
    param: unknown,
): string | undefined {
    return typeof param === 'string' ? param : undefined;
}
