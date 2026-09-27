---
title: "Y Combinator for Dysfunctional Non-Schemers"
date: 2007-05-06 05:37:49 +0000
tags:
  - software-engineering
toc: true
toc_label: "Contents"
---

A lot of software developers don't come from a Computer Science background. I think in the long run this doesn't matter, since I've seen a lot of CS grads who have completely forgotten things that are supposed to set them apart from the rest of us ("Lisp? You mean that AI language with a lot of parentheses? Yeah I used it before in uni. So?"). [Besides, a lot of CS grads can't program anyway](http://www.codinghorror.com/blog/archives/000781.html). Plus, if one really cares about the programming craft, during his/her journey of ever improving his/her efficiency and effectiveness as a software programmer, one tends to come full circle and go back to the root, which is made of the stuff CS grads are forced to read about in university.

Now one of the thing that I find really interesting, yet had baffled me for a long time, is the Y Combinator (no, ***not*** [Paul Graham's company](http://ycombinator.com/faq.html)). Maybe CS students eat Y Combinator for breakfast. But I graduated as an electrical engineer. It's only recently, when my programming self-improvement routine brought me to study Lisp, Scheme, and recursion in greater details, that I came across this strange Y thing that so many very smart people, like [this guy](http://www.dreamsongs.com/Files/WhyOfY.pdf), [this guy](ftp://ftp.cs.indiana.edu/pub/scheme-repository/doc/pubs/Y.ps.gz), and [this guy](http://www.cs.brown.edu/courses/cs173/2002/Lectures/2002-10-28-lc.pdf) have written about. Before this I've never heard of it in my life. It's like I'm trying to digest what I think is a very cool and profound concept, and then I come across these mental landmines like "pass the function as the first argument to itself", and my brain will just explode and I have to restart all over again.

What is Y Combinator, exactly? Why does it work? I do real-world applications in Java/C#/C++/JavaScript or whatever, I don't do Scheme for a living. What's in it for me? Is it just a cool idea with no practical applications whatsoever? I find that the best way for me to understand something is to write about it. So here it is.

## JavaScript: Lisp in C's Clothing

All examples will be in JavaScript. Examples in Lisp/Scheme can be difficult to read, especially when you're not used to the language yet. Writing the examples and illustrations in the familiar C-syntax will make it easier for me (and you, if you're one of the two or three people who are reading this). The examples won't be in Java, because [Java's obsession with nouns](http://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html) will make it awkward to write them. The fact that [functions are first-class in JavaScript](http://msdn.microsoft.com/msdnmag/issues/07/05/JavaScript/default.aspx#S2) makes things a LOT easier. (If you need a short intro of JavaScript's true capabilities, I'd shamelessly recommend this [article](http://msdn.microsoft.com/msdnmag/issues/07/05/JavaScript/default.aspx).) So, with that out of the way, let's start!

## The Problem

Let's start by a simple basic recursive function: factorial. Simplest function in the world, right? It's like the Hello World of recursion.

```js
function factorial(num) {
    if(num < 2) {
        return 1;
    }
    return num * factorial(num - 1);
}
```

Of course, functions are first-class in JavaScript, so we could've written it like this:

```js
var factorial = function(num) {
    if(num < 2) {
        return 1;
    }
    return num * factorial(num - 1);
};
```

But now we have a potential problem, don't we? The recursive call to factorial within the method only works because we happen to name the variable "factorial" as well. Should we name the variable differently, say, "fact", instead of "factorial":

```js
var fact = function(num) {
    if(num < 2) {
        return 1;
    }
    return num * factorial(num - 1);
};
```

Then we get an error, because when we call "factorial(num - 1)", the name "factorial" is not bound to anything. We can fix it for this case by changing the call to "fact(num - 1)", of course, but this approach is a quick fix that doesn't work, because this function can be assigned to any variable of any name.

We have a problem that can be summed up thus: ***a recursive function is a function that calls itself. But an anonymous function has no name. So... how is it supposed to call itself for recursion?***

## First Attempt

(If you're thinking: "Just give the bloody function a bloody name so you can make it recursive and get on with your life!", I can't say I totally disagree with you at this point. But anyway.)

So what can we do here? Well for one, we can keep the function anonymous, and get the name for recursion from a parameter passed to the anonymous function, like this:

```js
var fact = function(forRec, num) {
    if(num < 2) {
        return 1;
    }
    return num * forRec(forRec, num - 1);
};
```

Then when we want to use it, we just pass the name of the function to itself, like this:

```
js> fact(fact, 0)
1.0
js> fact(fact, 1)
1.0
js> fact(fact, 2)
2.0
js> fact(fact, 3)
6.0
```

No matter what the name is, as long as we keep passing the same name as the first parameter, we'll be OK--the anonymous function will be correctly calling itself.

## But... OK, Second Attempt

The solution *kinda* works. But it's not nice, requiring your users to your function name twice everytime they want to use it. Besides, now the code becomes less clear--everybody knows factorial, but this self-passing-to-self business is obfuscating the code. I believe we can do better. Let's try to separate the "passing a function to itself" bit from the "calculate factorial of" bit, by currying it. Like this:

```js
var createFact = function(forRec) {
    return function(num) {
        if(num < 2) {
            return 1;
        }
        return num * (forRec(forRec))(num - 1);
    };
};
```

([Currying, or Schönfinkelisation](http://en.wikipedia.org/wiki/Currying), is a lesson to all of us to choose names that are easy to spell, remember, and pronounce. Or else you may invent something and the other guy with the catchier name--who can compete with Curry?--gets the credit.)

In the snippet above, the outer anonymous function (the one with forRec as a parameter) returns another anonymous function (the one accepting parameter num). The latter is very similar to our original factorial function (remember that our objective is to separate the passing-function-to-itself bit from the factorial bit), except for the bit in green:

<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span style="color: #276b31;">(forRec(forRec))</span>(num - 1);</code></pre></div></div>

That line is where the inner function needs to recurse. But instead of requiring a name to recurse, it calls the outer function... which returns the inner function itself. And that returned inner function is in turn called, with "num - 1" as its argument. There we have our recursion.

So now we have a slightly cleaner solution. We can use the outer function to create the inner function like this:

```
js> var factorial = createFact(createFact);
js> factorial(10)
3628800.0
```

Note that this is equivalent to this one-liner:

```
js> createFact(createFact)(10)
3628800.0
```

Hmmm. The code for the factorial function is still polluted, though. Let's try to take out the anonymous recursion part from the factorial function entirely.

## Third Attempt: Wrap, and wrap, and wrap, and wrap...

Our second attempt is still not as clean as we want it to be. Ideally, we want to separate the part that takes care of the anonymous recursion, from the part that actually does the factorial computation. Let's see our last function again:

```js
var createFact = function(forRec) {
    return function(num) {
        if(num < 2) {
            return 1;
        }
        return num * (forRec(forRec))(num - 1);
    };
};
```

The only difference between the inner function and a typical factorial function is the recursive part. Let's try to take that forRec(forRec) bit out--that is, instead of doing it inside, let's see if we can do it outside and pass it in as a parameter. Here's the function again, with the forRec(forRec) taken out of the picture:

```js
var fact = function(rec) {
    return function(num) {
        if(num < 2) {
            return 1;
        }
        return num * rec(num - 1);
    };
};
```

And like I said above, we do the forRec(forRec) outside, and then pass it to the fact function:

```js
var recur = function(forRec) {
    return function(n) {
        return fact(forRec(forRec))(n);
    }
};
```

Then we use it like this:

```
js> var factorial = recur(recur);
js> factorial(6)
720.0
```

Or, as we've seen above:

```
js> recur(recur)(6)
720.0
```

Did you follow what happened during the `recur(recur)` call this time? From `recur`'s definition, a call to `recur(recur)` returns an anonymous function like this (substituting the parameter with the actual argument):

```js
function(n) {
    return fact(recur(recur))(n);
}
```

Let's see what happens when this anonymous function is called: it returns the result of calling `fact(recur(recur))` with argument n. Now what does `fact(recur(recur))` evaluate to? If we go back to the definition of `fact`, it returns the following anonymous function:

```js
function(num) {
    if(num < 2) {
        return 1;
    }
    return num * recur(recur)(num - 1);
};
```

which does the actual computation of the factorial. And when we reach this line:

```js
return num * recur(recur)(num - 1);
```

We see that we have `recur(recur)`. Which we have shown above, to eventually evaluate back to this factorial-computing anonymous function itself. In other words, it is calling itself. Ladies and gentlemen, we have recursion!

## Okay... So What?

Indeed. So what? In the last attempt, we still have to call recur(recur) before using it? Well, the difference is that we have separated the anonymous recursion mechanism from the factorial logic. So for instance, instead of hard-coding the call to `fact` inside recur, we can make it a parameter, like this:

```js
var recurWrapper = function(f) {
    var recur = function(forRec) {
        return function(n) {
            return f(forRec(forRec))(n);
        }
    };
    return recur(recur);
};
```

Then we can use it like this:

```
js> recurWrapper(fact)(6);
720.0
```

Eh, that's better! No more of this passing self to self bit (because it's wrapped inside the wrapper). And now we can tidy up recurWrapper a bit. Shortening parameter names a bit and naming the recur function (instead of assigning the anonymous function to a variable called recur) gives us this:

```js
var recurWrapper = function(f) {
    function recur(forRec) {
        return function(n) {
            return f(forRec(forRec))(n);
        }
    };
    return recur(recur);
};
```

There is a better name for recurWrapper, and that is Y:

```js
function Y(f) {
    function recur(r) {
        return function(n) {
            return f(r(r))(n);
        }
    };
    return recur(recur);
}
```

which is really the JavaScript version of the (applicative-order or not? we shall see) Y Combinator. And it works with any single argument anonymous function that is supposed to be recursive. For example, here's Y with a function to compute the Fibonacci number:

```js
var fibo = Y(function(f) {
    return function(n) {
        if(n <= 2) {
            return 1;
        } else {
            return f(n - 1) + f(n - 2);
        }
    }
});
```

## Applicative Order Y Or Not (And What The Heck Is That?)?

[Here's a good explanation](http://mitpress.mit.edu/sicp/full-text/sicp/book/node85.html). In short, there are two ways of evaluation in programming languages. *Applicative order* is eager evaluation: arguments to a function are evaluated first before the function itself is executed. Whereas the *normal order* is lazy. Arguments to functions are evaluated when they need to be evaluated.

As such, there are two flavours of Y as well. The classic Y Combinator works when we're using normal order of evaluation, but will hang when the evaluation is applicative order (just like in JavaScript, which evaluates the arguments first before a function is called). This normal Y Combinator is defined as such in lambda calculus:

**Y** = λf·(λx·f (x x)) (λx·f (x x))

which is closer to this:

```js
function normalY(f) {
    function recur(x) {
        return f(x(x));
    }
    return recur(recur);
}
```

Which will hang, obviously, if you think in the applicative order way of thinking. The Y we just derived earlier, on the other hand, is applicative order. Note the difference in lambda calculus definition (the difference is in bold italic):

**Z** = λf. (λx. f (***λy***. x x ***y***)) (λx. f (***λy***. x x ***y***))

and its corresponding JavaScript version:

```js
function applicativeOrderY(f) {
    function recur(x) {
        return function(y) {
            return f(x(x))(y);
        }
    };
    return recur(recur);
}
```

## Right. Okay. So What's In It For Me?

Yeah. That's it. What's in it for me beyond the "oh, neat" factor? Er. Frankly, I'm not sure. In the real world, if I need to write a recursive function, I will just give it a bloody name. Like alucard(). And doing Y combinator in your JavaScript codebase will probably piss off a web designer who has the misfortune of maintaining your code in the future.

I guess the main benefit of this whole exercise is that I feel good about understanding the Y combinator at last. It won't make me a better programmer, at least in the short run, but heck. Having an iPod also doesn't make your life any better other than making you feel good. So there.

***UPDATE:*** I was surprised to see a big jump in my blog stat! Turned out that [Matt Jaynes](http://blog.nanobeepers.com/) submitted [this article to Y Combinator Startup News](http://news.ycombinator.com/comments?id=19960), and then [linuxer](http://programming.reddit.com/user/linuxer/) submitted [it to programming subreddit](http://programming.reddit.com/info/1p5yz/comments)!

Christophe Grand and others in reddit and news.ycombinator pointed out that JavaScript has a built-in way of doing this using [arguments.callee](http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Function:arguments:callee) (see also Christophe's comment below for a short example of how this is done). My intention was to derive the Y Combinator using a language with which a lot of people (including myself) are familiar (that is, JavaScript), instead of answering the question "how does one make an anonymous function call itself in JavaScript?", but thanks anyway, guys!

Chris Rathman [pointed out here](http://programming.reddit.com/info/1p5yz/comments/c1p7gh) that I'm still using a named function for my definition of Y(). Here's my definition of Y again:

```js
function Y(f) {
    function recur(r) {
        return function(n) {
            return f(r(r))(n);
        }
    };
    return recur(recur);
}
```

This definition is probably easier to understand because it uses JavaScript constructs that are familiar to most people, but like Chris said, we can go for the fully anonymous variant. Douglas Crockford also has a fully anonymous version in his [The Little JavaScripter](http://www.crockford.com/javascript/little.html) page, but let's see how we can get to there from the definition we've seen in this article.

First of all, remember that in JavaScript, we can define and call a function at one go like this:

```
js> var y = function(x) { return x * x; }(2);
js> y
4.0
```

So with that in mind, we can replace the last line "return recur(recur);" with an anonymous function that wraps around it like this:

```js
var Y = function(f) {
    return function(recur) {
        return recur(recur);
    }( /* we must pass something here */ );
};
```

And now what's left, is to call this anonymous function directly, passing the (anonymized) body of the recur function in my original definition of Y. Like this:

```js
var anonY = function(f) {
    return function(recur) { return recur(recur); } (
        function (r) {
            return function(n) {
                return f(r(r))(n);
            }
        }
    );
};
```

Which looks a little different from Douglas Crockford's version (which is more similar to the one Chris posted in reddit), but they're really different ways of saying the same thing. Man! This whole thing surely has been real educational for me 🙂 (And I hope for you too!) Thanks very much, everyone!
