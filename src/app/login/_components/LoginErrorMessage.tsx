export default function LoginErrorMessage({ error }: { error: any }) {
    return <div>
        <h1>로그인 실패</h1>
        <p>{error.message}</p>
    </div>
}

