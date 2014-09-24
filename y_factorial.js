/*
    Y-Combinator implementation in JavaScript inspired by talk
    given by Jim Weirich

    This implementation consists of steps that is required if you
    want to track how to came up with a real solution for Y-Combinator

    Referencies:

        * FIXPOINT:
            http://en.wikipedia.org/wiki/Fixed_point_(mathematics)

        * HIGHER-ORDER FUNCTIONS:
            http://en.wikipedia.org/wiki/Higher-order_function

    Used techniques:

    Given:
        return 42;

    1. Tennent Correspondence Principle:

        // Immediate call
        return (function () { return 42; })()

    2. Binding:

        // Useless variable
        return (function (v) { return 42; })("not_used_long_value")

 */


/* 1. Naive implementation in JavaScript */

function fact(x){
    return x < 2 ? 1 : x * fact(x - 1)
}

console.log("#1.");
console.log(fact(5));
console.log("----");

/* 2. Different functional terms and methods
*
*   Partial Application
*   Closure
*   Composition
*   Higher-order function
*
* */

console.log("#2.");
console.log(function(){

    // Add 1 to given argument
    var adderByOne = function(n) { return (function() {return n + 1})() };

    // Compose two functions
    var composer = function(f, g) { return function(x) { return f(g(x)) } };

    // Create a function that returns functions based on
    // multiplication factor argument
    var maker_mul = function(factor){
        return function(val) {
            return val * factor;
        }
    };

    // Make a function that will multiply by 10 given value
    var multuplyBy10 = maker_mul(10);

    // Compose functions
    return composer(multuplyBy10, adderByOne)(5);

}());
console.log("----");

/* 3. Going deep into the problem:
      We can't repeatedly call function that has no name
*/

console.log("#3.");
console.log(function(){

    // Acts as a stub function
    var helper = function() { throw "Should not be called"; };

    // Imitates recursion calls
    var factorial_transform = function(fact_partial){
        return function(n){return n == 0 ? 1 : n * fact_partial(n - 1)}
    };

    // Get 0!
    var fact_partial_0 = factorial_transform(helper);

    // Get 1!
    var fact_partial_1 = factorial_transform(fact_partial_0);

    return fact_partial_1(1);
    // Get 2! throws "Should not be called"
    //return fact_partial_1(2);
}());
console.log("----");

/* 4. Start experimenting:
 */

console.log("#4.");
console.log(function(){

    var factorial_transform = (function (transform) {
        // Instead of 'helper' try to use itself

        // Using 'transform()' acts as 'transform(undefined)'
        return transform(transform);
    })
    (function(partial){
        return function(n) {
            return n == 0 ? 1 : n * partial(n - 1);
        };
    });

    // fact_creator     => [Function]
    // fact_creator(x)  => Function Application

    // Get 0! - works
    return factorial_transform(0);

    // Get 1! - doesn't work (NaN)
    //return factorial_transform(1)
}());
console.log("----");

/* 5. Continue experimenting:

    As 'partial' is meant to be passed a real attribute
    Which is a function, try to put there itself

 */
console.log("#5.");
console.log(function(){

    var factorial_transform = (function (transform) {
        return transform(transform)
    })
    (function(transform){
        // 'factorial_transform' will be an alias to this function
        return function(n){
            return n == 0 ? 1 : n * transform(transform)(n-1)
        }
    });

    // Works fine
    return factorial_transform(5);
}());
console.log("----");

/* 6. Continue experimenting:

    Use 'Tennent Correspondence Principle'
    Use 'Binding'
    Replace 'transform' with 'gen'

 */

// In order to execute whole script at once, comment the #6 block
console.log("#6.");
console.log(function(){

    var factorial_transform = (function (gen) {
        return gen(gen)
    })
    (function(gen){
        return (function(notused){  // <-- this was added
            return function(n){ return n == 0 ? 1 : n * gen(gen)(n-1); }
        })(gen(gen));            // <-- causes infinite recursion as evaluates
    });                          //     immediately (Applicative Order).
                                 //     We have to delay somehow this evaluation
                                 //     Let's do this by applying
                                 //     'Tennent Correspondence Principle' once again

    // Infinite recursion as a result
    return factorial_transform(5)
}());
console.log("----");

/* 7. Continue experimenting:

    Wrap 'gen(gen)' to delay evaluation

 */
console.log("#7.");
console.log(function(){

    var factorial_transform = (function (gen) {
        return gen(gen)
    })
    (function(gen){
        return (function(partial){
            return function(n){ return n == 0 ? 1 : n * partial(n-1) }
        })( function(v){ return gen(gen)(v) } )     // <-- add a function wrap here
    });

    return factorial_transform(5)
}());
console.log("----");

/* 8. Finalizing the solution:

    Externalize the main logic - move to outer scope

 */
console.log("#8.");
console.log(function(){

    return function(code){
        return (function (gen) {
            return gen(gen)
        })
        (function(gen){
            // 'code' reflects the function being passed here
            // It accepts itself as an argument
            return code( function(v){ return gen(gen)(v) } );
        })
        // Function that's defined a real logic is passed by argument now
    }(function(partial){
        return function(n){ return n == 0 ? 1 : n * partial(n-1) }
     })(5);
}());
console.log("----");

/* 9. Finalizing the solution:

    Get all code that knows about function out
    of the whole expression and also brake code to parts
    in order to make sense a reasoning about them

 */
console.log("#8.");
console.log(function(){

    // Transforms the function being put as argument
    var factorial_transform = function(transform){
        return function(n){ return n == 0 ? 1 : n * transform(n-1) }
    };

    // Y-Combinator
    var Y = function(code){
        return (function (gen) {
            return gen(gen)
        })
        (function(gen){
            // 'code' reflects the function being passed here
            // It accepts itself as an argument
            return code( function(v){ return gen(gen)(v) } );
        })
    };

    // Calculates the Fixpoint of a function
    var factorial = Y(factorial_transform);

    // 'factorial' is the Fixpoint of 'factorial_transform'
    factorial = factorial_transform(factorial);

    return factorial(5)
}());
console.log("----");

/* 9. Standardize the look

 Get all code that knows about function out
 of the whole expression and also brake code to parts
 in order to make sense a reasoning about them

 */
console.log("#8.");
console.log(function(){

    // Returns its argument
    var factorial_transform = function(transform){
        return function(n){ return n == 0 ? 1 : n * transform(n-1) }
    };

    // Applicative Order Y-Combinator
    // Z-Combinator
    // Fixpoint Combinator

    // Calculates the fixpoint of an improver function
    var Y = function(func){
        return (function (gen) {
            // Applying an argument 'func' will not have effect
            // due to its recursive nature. Even the following is possible
            // return func(func(gen(gen)))
            // return func(func(func(gen(gen))))
            // return func(func(func(func(gen(gen)))))

            // 2. Introduce meaningless binding (n)
            return func( function(n){ return gen(gen)(n) } )

            // 3. Profit: we have symmetry
        })
        (function(gen){
            return func( function(n){ return gen(gen)(n) } );
        })
    };

    var factorial = Y(factorial_transform);

    return factorial(4);

    factorial = factorial_transform(factorial);

    return factorial(5)

}());