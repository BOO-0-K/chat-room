const codes = ['TEST'];
const users = [];

const addUser = ({ id, name, code }) => {
    name = name.trim();
    code = code.trim();

    // 임시 점검 코드
    // return {
    //     error: '점검중입니다.'
    // }

    // 유효성 검사
    if (!name || name == '관리자') {
        return {
            error: '닉네임이 올바르지 않습니다.'
        }
    }
    if (!code) {
        return {
            error: '코드값이 올바르지 않습니다.'
        }
    }

    // 코드 검사
    const existingCode = codes.find((joinCode) => {
        return code === joinCode;
    });

    if (!existingCode) {
        return {
            error: '유효하지 않은 코드입니다.'
        }
    }

    // 닉네임 중복 검사
    const existingUser = users.find((user) => {
        return user.code === code && user.name ===name;
    });

    if (existingUser) {
        return {
            error: '이미 사용중인 닉네임입니다.'
        }
    }

    const user = { id, name, code };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsers = (code) => {
    code.trim();
    return users.filter((user) => user.code === code);
} 

export { addUser, removeUser, getUser, getUsers };