export const resolveUser = (navigation, route) => {
    if (route?.params?.user) return route.params.user;
    try {
        let state = navigation?.getState?.();
        let current = state;
        while (current?.routes && typeof current.index === 'number') {
            const r = current.routes[current.index];
            if (!r) break;
            if (r.params?.user) return r.params.user;
            if (r.params?.params?.user) return r.params.params.user;
            if (r.state) current = r.state;
            else break;
        }
    } catch { }
    return null;
};

export const resolveActiveName = (navigation, route) => {
    try {
        let state = navigation?.getState?.();
        let current = state;
        let name = route?.name;
        while (current?.routes && typeof current.index === 'number') {
            const r = current.routes[current.index];
            if (!r) break;
            name = r.name || name;
            if (r.state) current = r.state;
            else break;
        }
        return name;
    } catch {
        return route?.name;
    }
};
