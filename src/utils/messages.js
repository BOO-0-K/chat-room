const generateMessage = (name, text) => {
    return {
        name,
        text,
        createdAt: new Date().getTime()
    }
}

export { generateMessage };