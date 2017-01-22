def collapse(items):
    """
    collapse([1,2,3]) -> [1,2,3]
    collapse([[1,2,3]]) -> [1,2,3]
    """
    if len(items) == 1 and isinstance(items[0], list):
        return items[0]
    else:
        return items
